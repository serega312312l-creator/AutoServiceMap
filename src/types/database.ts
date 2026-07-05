export interface DatabaseRegionManifest {
  id: string;
  name?: string;
  count: number;
  version: string;
}

export interface DatabaseManifest {
  version: string;
  generated_at: string;
  total: number;
  base_url?: string;
  regions: DatabaseRegionManifest[];
}

export interface DatabaseUpdateStatus {
  checking: boolean;
  downloading: boolean;
  lastCheckAt: string | null;
  lastUpdateAt: string | null;
  localCount: number;
  bundledCount: number;
  message: string | null;
  error: string | null;
}
