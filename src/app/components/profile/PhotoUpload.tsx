"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "../Button";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (file: File | null) => void;
}

export function ProfilePhotoUpload({
  currentPhoto,
  onPhotoChange,
}: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de tipo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem");
        return;
      }

      // Validação de tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onPhotoChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {preview ? (
            <img
              src={preview}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-100">
              <Camera className="w-12 h-12 text-primary-600" />
            </div>
          )}
        </div>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        {preview ? "Alterar foto" : "Adicionar foto"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        JPG, PNG ou GIF (máx. 5MB)
      </p>
    </div>
  );
}
