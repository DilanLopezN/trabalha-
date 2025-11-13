"use client";

import { useState, useRef } from "react";
import { FileText, Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../Button";
import { useApi } from "@/hooks/useApi";

interface ResumeUploadProps {
  currentResume?: string;
  onResumeChange: (url: string | null) => void;
}

export function ResumeUpload({
  currentResume,
  onResumeChange,
}: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string | null>(
    currentResume ? "Currículo atual" : null
  );
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { api } = useApi();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validação de tipo (PDF e DOC/DOCX)
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      alert("Por favor, selecione apenas arquivos PDF, DOC ou DOCX");
      return;
    }

    // Validação de tamanho (máx 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("O arquivo deve ter no máximo 10MB");
      return;
    }

    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);

    // Upload para R2
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "resume");

      const data = await api("/api/upload", {
        method: "POST",
        body: formData,
      });
      setUploadedPath(data.path);
      onResumeChange(data.url);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao fazer upload do currículo"
      );
      setFileName(null);
      setFileSize(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (uploadedPath) {
      try {
        await api(`/api/upload?path=${uploadedPath}&type=resume`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Erro ao deletar currículo:", error);
      }
    }

    setFileName(null);
    setFileSize(null);
    setUploadedPath(null);
    onResumeChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {fileName ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileName}
                </p>
                {!isUploading && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {isUploading && (
                  <Loader2 className="w-4 h-4 text-primary-600 animate-spin flex-shrink-0" />
                )}
              </div>
              {fileSize && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(fileSize)}
                </p>
              )}
              {isUploading && (
                <p className="text-xs text-primary-600 mt-1">Enviando...</p>
              )}
            </div>

            {!isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {!isUploading && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClick}
                className="gap-2 w-full"
              >
                <Upload className="w-4 h-4" />
                Substituir arquivo
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                {isUploading
                  ? "Enviando currículo..."
                  : "Clique para fazer upload do currículo"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC ou DOCX (máx. 10MB)
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
