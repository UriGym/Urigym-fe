import { useRef, useState } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadsApi } from "@/api/misc";
import { apiClient } from "@/api/client";

interface ImageUploadFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
}

export const ImageUploadField = ({ label, description, value, onChange }: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    try {
      onChange(await uploadsApi.upload(file));
      toast.success(`${label} 업로드 완료`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
          <img
            src={apiClient.fileUrl(value)}
            alt={label}
            className="w-14 h-14 rounded object-cover bg-muted"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = "hidden";
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              업로드됨
            </p>
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
            변경
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-20 flex-col gap-2"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">파일 선택 (이미지 / PDF)</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};
