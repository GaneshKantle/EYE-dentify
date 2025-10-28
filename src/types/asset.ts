export interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  cloudinary_url: string;
  tags: string[];
  description?: string;
  upload_date: string;
  usage_count: number;
  metadata: {
    width: number;
    height: number;
    file_size: number;
    format: string;
  };
}

export interface AssetUpload {
  name: string;
  type: string;
  description?: string;
  tags: string[];
  file: File;
}
