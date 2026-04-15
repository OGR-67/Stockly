#!/bin/bash

set -e

TIMEOUT=0.2

SERVER_IP=$(hostname -I | awk '{print $1}')
SUBNET=$(echo "$SERVER_IP" | cut -d. -f1-3)

echo ""
echo "=== Découverte automatique des imprimantes ==="
echo "Scan du réseau $SUBNET.0/24 (ports 631 IPP + 9100 JetDirect)..."
echo ""

declare -A ipp_ips
declare -A raw_ips

for i in {1..254}; do
    ip="$SUBNET.$i"
    [ "$ip" = "$SERVER_IP" ] && continue
    if timeout $TIMEOUT bash -c "echo >/dev/tcp/$ip/9100" 2>/dev/null; then
        raw_ips[$ip]=1
        echo "✓ JetDirect (9100) : $ip"
    elif timeout $TIMEOUT bash -c "echo >/dev/tcp/$ip/631" 2>/dev/null; then
        ipp_ips[$ip]=1
        echo "✓ IPP (631)        : $ip"
    fi
done

if [ ${#ipp_ips[@]} -eq 0 ] && [ ${#raw_ips[@]} -eq 0 ]; then
    echo "Aucune imprimante trouvée"
    exit 0
fi

# Map Brother model name → PPD
get_brother_ppd() {
    local model="$1"
    case "$model" in
        *PT-P950NW*) echo "ptouch:0/ppd/ptouch-driver/Brother-PT-P950NW-ptouch-pt.ppd" ;;
        *PT-P900W*)  echo "ptouch:0/ppd/ptouch-driver/Brother-PT-P900W-ptouch-pt.ppd" ;;
        *PT-P750W*|*PT-P700*) echo "ptouch:0/ppd/ptouch-driver/Brother-PT-P700-ptouch-pt.ppd" ;;
        *PT-P710BT*) echo "ptouch:0/ppd/ptouch-driver/Brother-PT-P710BT-ptouch-pt.ppd" ;;
        *PT-E550W*)  echo "ptouch:0/ppd/ptouch-driver/Brother-PT-E550W-ptouch-pt.ppd" ;;
        *QL-820*)    echo "ptouch:0/ppd/ptouch-driver/Brother-QL-820NWB-ptouch-ql.ppd" ;;
        *QL-810W*)   echo "ptouch:0/ppd/ptouch-driver/Brother-QL-810W-ptouch-ql.ppd" ;;
        *QL-800*)    echo "ptouch:0/ppd/ptouch-driver/Brother-QL-800-ptouch-ql.ppd" ;;
        *QL-700*)    echo "ptouch:0/ppd/ptouch-driver/Brother-QL-700-ptouch-ql.ppd" ;;
        *) echo "" ;;
    esac
}

echo ""
echo "Création des queues..."

# --- JetDirect (port 9100) : Brother PT/QL ---
for ip in "${!raw_ips[@]}"; do
    # Skip if a socket queue for this IP already exists
    if lpstat -v 2>/dev/null | grep -q "socket://$ip"; then
        echo "  → $ip : queue socket existante, ignoré"
        continue
    fi

    # Try SNMP for model name (requires snmp package)
    model=""
    if command -v snmpget &>/dev/null; then
        model=$(snmpget -v1 -c public -Ovq "$ip" .1.3.6.1.2.1.25.3.2.1.3.1 2>/dev/null | tr -d '"' || true)
    fi

    queue_name="${model:-Printer}_${ip//./_}"
    queue_name=$(echo "$queue_name" | tr ' ' '_' | tr -dc 'A-Za-z0-9_-')

    ppd=$(get_brother_ppd "$model")

    if [ -n "$ppd" ]; then
        echo "  → $queue_name ($ip) : Brother détecté, PPD=$ppd"
        lpadmin -p "$queue_name" -E -v "socket://$ip:9100" -m "$ppd" -o Resolution=360dpi
    else
        # Unknown JetDirect device — try IPP everywhere as fallback
        echo "  → $queue_name ($ip) : modèle inconnu ($model), tentative IPP everywhere"
        lpadmin -p "$queue_name" -E -v "ipp://$ip" -m everywhere || \
            echo "    ✗ IPP everywhere échoué, ajout manuel requis (socket://$ip:9100)"
    fi

    echo "    ✓ Créée"
done

# --- IPP standard ---
for ip in "${!ipp_ips[@]}"; do
    if lpstat -v 2>/dev/null | grep -q "ipp://$ip"; then
        echo "  → $ip : queue IPP existante, ignoré"
        continue
    fi

    printer_name=$(ipptool -tv "ipp://$ip/ipp/print" get-printer-attributes.test 2>/dev/null \
        | grep "printer-name" | grep -oP '= \K.+' | head -1 | tr ' ' '_')
    [ -z "$printer_name" ] && printer_name="Printer_${ip//./_}"

    echo "  → $printer_name ($ip) : IPP everywhere"
    lpadmin -p "$printer_name" -E -v "ipp://$ip" -m everywhere
    echo "    ✓ Créée"
done

echo ""
echo "Imprimantes disponibles :"
lpstat -p
