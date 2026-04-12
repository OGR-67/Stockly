#!/bin/bash

set -e

TIMEOUT=0.2

SERVER_IP=$(hostname -I | awk '{print $1}')
SUBNET=$(echo "$SERVER_IP" | cut -d. -f1-3)

echo ""
echo "=== Découverte automatique des imprimantes ==="
echo "Scan du réseau $SUBNET.0/24 port 631..."
echo ""

found_ips=()
for i in {1..254}; do
    ip="$SUBNET.$i"
    [ "$ip" = "$SERVER_IP" ] && continue # skip host because cups will be found
    if timeout $TIMEOUT bash -c "echo >/dev/tcp/$ip/631" 2>/dev/null; then
        found_ips+=("$ip")
        echo "✓ Trouvé: $ip"
    fi
done

if [ ${#found_ips[@]} -eq 0 ]; then
    echo "Aucune imprimante trouvée"
    exit 0
fi

echo ""
echo "Création des queues..."

for ip in "${found_ips[@]}"; do
    # Get name from IPP directly
    printer_name=$(ipptool -tv "ipp://$ip/ipp/print" get-printer-attributes.test 2>/dev/null \
        | grep "printer-name" | grep -oP '= \K.+' | head -1 | tr ' ' '_')

    # Fallback name
    if [ -z "$printer_name" ]; then
        printer_name="Printer_$ip"
    fi

    # Skip if queue already exists
    if lpstat -v 2>/dev/null | grep -q "ipp://$ip"; then
        echo "  → $printer_name ($ip) : queue existante"
        continue
    fi

    echo "  → $printer_name : création..."
    lpadmin -p "$printer_name" -E -v "ipp://$ip" -m everywhere
    echo "    ✓ Créée"
done

echo ""
echo "Imprimantes disponibles:"
lpstat -p
