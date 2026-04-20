import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

interface CvFileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  cvCount: number;
}

export function CvFileDropzone({
  onFilesSelected,
  cvCount,
}: CvFileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: File[]) => {
      if (rejectedFiles.length > 0) {
        alert(
          "Some files are not supported. Accepted formats: PDF, DOCX, TXT.",
        );
      }
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 50,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-display text-lg">Upload CVs</CardTitle>
        {cvCount > 0 && (
          <Badge variant="secondary">
            {cvCount} CV{cvCount > 1 ? "s" : ""}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"}`}
        >
          <input {...getInputProps()} />
          <Upload
            className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? "text-primary" : "text-muted-foreground"}`}
          />
          <p className="text-foreground font-medium mb-1">
            {isDragActive
              ? "Drop files here"
              : "Drag and drop CVs here"}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            or click to select files
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded-md">PDF</span>
            <span className="px-2 py-1 bg-muted rounded-md">DOCX</span>
            <span className="px-2 py-1 bg-muted rounded-md">TXT</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Maximum 50 files
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
