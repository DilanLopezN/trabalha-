"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { Button } from "../Button";

interface AdImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string | null) => void;
}

export function AdImageUpload({
  currentImage,
  onImageChange,
}: AdImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "ad");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer upload");
      }

      const data = await response.json();
      setUploadedPath(data.path);
      onImageChange(data.url);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao fazer upload da imagem"
      );
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (uploadedPath) {
      try {
        await fetch(`/api/upload?path=${uploadedPath}&type=ad`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Erro ao deletar imagem:", error);
      }
    }

    setPreview(null);
    setUploadedPath(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-video w-full bg-gray-100">
            <img
              src={preview}
              alt="Preview do anúncio"
              className="w-full h-full object-cover"
            />
          </div>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {!isUploading && (
            <div className="p-3 border-t border-gray-200 bg-white">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClick}
                className="gap-2 w-full"
              >
                <Upload className="w-4 h-4" />
                Alterar imagem
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed aspect-video flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                {isUploading
                  ? "Enviando imagem..."
                  : "Clique para adicionar imagem"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG ou GIF (máx. 5MB)
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
