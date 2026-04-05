import { useState, useEffect } from "react";
import Barcode from "react-barcode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "./Modal";
import { LoadingSpinner } from "./layout/LoadingSpinner";
import { productService } from "../services";
import { queryKeys } from "../hooks/queries/queryKeys";
import {
  usePrinters,
  usePrinterFormats,
  usePrint,
} from "../hooks/queries/usePrinter";
import { useSettings } from "../hooks/useSettings";
import type { ProductDetail } from "../models/ProductModel";

interface PrintModalProps {
  product: ProductDetail;
  expirationDate: Date | null;
  onClose: () => void;
}

const PREVIEW_SCALE = 4; // px per mm

export function PrintModal({
  product,
  expirationDate,
  onClose,
}: PrintModalProps) {
  const queryClient = useQueryClient();
  const { settings } = useSettings();

  const [barcode, setBarcode] = useState<string | null>(
    product.barcodes.length > 0 ? product.barcodes[0].code : null,
  );
  const [note, setNote] = useState(product.freeText ?? "");
  const [selectedPrinterId, setSelectedPrinterId] = useState<string | null>(
    settings.defaultPrinterId,
  );
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(
    settings.defaultFormatId,
  );

  const { data: printers = [] } = usePrinters();
  const { data: formats = [] } = usePrinterFormats(selectedPrinterId);
  const print = usePrint();

  // Auto-generate barcode if product has none
  useEffect(() => {
    if (product.barcodes.length === 0) {
      const generated = crypto.randomUUID();
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

  // Fallback: set first format if no setting saved yet
  useEffect(() => {
    if (formats.length > 0 && !selectedFormatId) {
      setSelectedFormatId(formats[0].id);
    }
  }, [formats]);

  const selectedFormat = formats.find((f) => f.id === selectedFormatId);
  const previewWidth = selectedFormat
    ? selectedFormat.widthMm * PREVIEW_SCALE
    : 240;
  const previewHeight = selectedFormat
    ? selectedFormat.heightMm * PREVIEW_SCALE
    : 120;

  async function handlePrint() {
    if (!selectedPrinterId || !selectedFormatId || !barcode) return;
    await print.mutateAsync({
      printerId: selectedPrinterId,
      formatId: selectedFormatId,
      job: {
        productName: product.name,
        expirationDate,
        barcode,
        note: note || null,
      },
    });
    onClose();
  }

  return (
    <Modal title="Imprimer l'étiquette" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Label preview */}
        <div
          style={{ width: previewWidth, height: previewHeight }}
          className="bg-white border-2 border-stone-300 rounded flex flex-col items-center justify-between p-2 mx-auto overflow-hidden"
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
            <Barcode
              value={barcode}
              height={30}
              displayValue={false}
              margin={0}
              width={1.2}
            />
          ) : (
            <LoadingSpinner />
          )}
          {note && (
            <p className="text-xs text-stone-500 text-center w-full truncate">
              {note}
            </p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm text-stone-500 mb-1">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
            placeholder="Note sur l'étiquette..."
          />
        </div>

        {/* Printer selector */}
        {printers.length > 1 && (
          <div>
            <label className="block text-sm text-stone-500 mb-1">
              Imprimante
            </label>
            <select
              value={selectedPrinterId ?? ""}
              onChange={(e) => {
                setSelectedPrinterId(e.target.value);
                setSelectedFormatId(null);
              }}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-cream"
            >
              {printers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {printers.length === 1 && (
          <p className="text-sm text-stone-500">
            Imprimante : <span className="text-bark">{printers[0].name}</span>
          </p>
        )}

        {/* Format selector */}
        {formats.length > 1 && (
          <div>
            <label className="block text-sm text-stone-500 mb-1">Format</label>
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
          </div>
        )}

        <button
          onClick={handlePrint}
          disabled={
            !barcode ||
            !selectedPrinterId ||
            !selectedFormatId ||
            print.isPending
          }
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-earth text-white font-medium disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPrint} />
          {print.isPending ? "Impression..." : "Imprimer"}
        </button>
      </div>
    </Modal>
  );
}
