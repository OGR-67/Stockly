import { useState, useEffect, useRef } from "react";
import Barcode from "react-barcode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "./Modal";
import { FormField } from "./FormField";
import { FieldWrapper } from "./FieldWrapper";
import { LoadingSpinner } from "./layout/LoadingSpinner";
import { productService } from "../services";
import { queryKeys } from "../hooks/queries/queryKeys";
import {
  usePrinters,
  usePrinterFormats,
  usePrintLabel,
} from "../hooks/queries/usePrinter";
import { useSettings } from "../hooks/useSettings";
import type { ProductDetail } from "../models/ProductModel";

interface PrintModalProps {
  product: ProductDetail;
  expirationDate: Date | null;
  copies?: number;
  onClose: () => void;
}

const PREVIEW_SCALE = 4; // px per mm

export function PrintModal({
  product,
  expirationDate,
  copies = 1,
  onClose,
}: PrintModalProps) {
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const previewRef = useRef<HTMLDivElement>(null);

  const [barcode, setBarcode] = useState<string | null>(
    product.barcodes.length > 0 ? product.barcodes[0].code : null,
  );
  const [note, setNote] = useState(product.freeText ?? "");
  const [selectedPrinterId, setSelectedPrinterId] = useState<string | null>(
    settings.defaultPrinterId,
  );
  const [printing, setPrinting] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(
    settings.defaultFormatId,
  );

  const { data: printers = [] } = usePrinters();
  const { data: formats = [] } = usePrinterFormats(selectedPrinterId);
  const printLabel = usePrintLabel();

  // Auto-generate barcode if product has none
  useEffect(() => {
    if (product.barcodes.length === 0) {
      const generated = String(Math.floor(Math.random() * 9_000_000_000_000) + 1_000_000_000_000);
      productService.addBarcode(product.id, generated).then(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.products });
        setBarcode(generated);
      });
    }
  }, []);

  // Fallback: set default printer if no setting saved yet
  useEffect(() => {
    if (printers.length > 0 && !selectedPrinterId) {
      const defaultPrinter = printers.find((p) => p.isDefault) ?? printers[0];
      setSelectedPrinterId(defaultPrinter.id);
    }
  }, [printers]);

  // Set first format if none selected or selected format no longer exists
  useEffect(() => {
    if (formats.length > 0) {
      const valid = formats.find(f => f.id === selectedFormatId);
      if (!valid) setSelectedFormatId(formats[0].id);
    }
  }, [formats]);

  const selectedFormat = formats.find((f) => f.id === selectedFormatId);
  const previewWidth = selectedFormat ? selectedFormat.widthMm * PREVIEW_SCALE : 240;
  const previewHeight = selectedFormat ? selectedFormat.heightMm * PREVIEW_SCALE : 120;
  const maxDisplayWidth = 280;
  const maxDisplayHeight = 220;
  const scale = Math.min(1, maxDisplayWidth / previewWidth, maxDisplayHeight / previewHeight);
  const displayWidth = previewWidth * scale;
  const displayHeight = previewHeight * scale;

  async function handlePrint() {
    if (!selectedPrinterId || !selectedFormatId || !barcode) return;
    setPrinting(true);
    try {
      for (let i = 0; i < copies; i++) {
        await printLabel.mutateAsync({
          printerId: selectedPrinterId,
          formatId: selectedFormatId,
          productName: product.name,
          expiryDate: expirationDate,
          note,
          barcodeValue: barcode,
        });
      }
      onClose();
    } catch (e) {
      window.dispatchEvent(new CustomEvent('api-error', { detail: (e as Error).message }));
    } finally {
      setPrinting(false);
    }
  }

  return (
    <Modal title="Imprimer l'étiquette" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Label preview */}
        <div style={{ width: displayWidth, height: displayHeight, position: 'relative', margin: '0 auto', flexShrink: 0, overflow: 'hidden' }} className="border-2 border-stone-300 rounded">
          <div style={{ transformOrigin: 'top left', transform: `scale(${scale})`, position: 'absolute', top: 0, left: 0 }}>
          <div
            ref={previewRef}
            style={{
              width: previewWidth,
              minHeight: previewHeight,
              padding: Math.max(8, previewWidth * 0.05),
            }}
            className="bg-white flex flex-col items-center justify-between"
          >
          <p className="font-bold text-center text-sm leading-tight w-full truncate">
            {product.name}
          </p>
          {expirationDate && (
            <p className="text-xs text-stone-600">
              DLC : {new Date(expirationDate).toLocaleDateString("fr-FR")}
            </p>
          )}
          {barcode ? (
            <div style={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
              <Barcode
                value={barcode}
                height={30}
                displayValue={false}
                margin={0}
                width={1.2}
              />
            </div>
          ) : (
            <LoadingSpinner />
          )}
          {note && (
            <p className="text-xs text-stone-500 text-center w-full truncate">
              {note}
            </p>
          )}
          </div>
          </div>
        </div>

        <FormField label="Note" value={note} onChange={setNote} placeholder="Note sur l'étiquette..." />

        {printers.length > 1 && (
          <FieldWrapper label="Imprimante">
            <select
              value={selectedPrinterId ?? ""}
              onChange={(e) => { setSelectedPrinterId(e.target.value); setSelectedFormatId(null) }}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-cream"
            >
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FieldWrapper>
        )}
        {printers.length === 1 && (
          <p className="text-sm text-stone-500">
            Imprimante : <span className="text-bark">{printers[0].name}</span>
          </p>
        )}

        {formats.length > 1 && (
          <FieldWrapper label="Format">
            <select
              value={selectedFormatId ?? ""}
              onChange={(e) => setSelectedFormatId(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-cream"
            >
              {formats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </FieldWrapper>
        )}

        <button
          onClick={handlePrint}
          disabled={
            !barcode ||
            !selectedPrinterId ||
            !selectedFormatId ||
            printing
          }
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-earth text-white font-medium disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPrint} />
          {printing ? "Impression..." : copies > 1 ? `Imprimer ×${copies}` : "Imprimer"}
        </button>
      </div>
    </Modal>
  );
}
