import { useEffect, useState, useRef } from "react";
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { useRepoContextStore } from "../../../stores/repoContextStore";
import { useFileTreeStore } from "../../../stores/fileTreeStore";
import { githubApi } from "../../../lib/github";
import { resolvePath } from "./resolvePath";
import type { ExtraProps } from "react-markdown";

const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
};

type CachedImage = {
  base64: string;
  mime: string;
};

const getImageCache = async (sha: string): Promise<CachedImage | null> => {
  return await idbGet(`image:${sha}`) ?? null;
};

const setImageCache = async (sha: string, cache: CachedImage) => {
  await idbSet(`image:${sha}`, cache);
};

export const ImageRenderer = (props: React.ComponentProps<'img'> & ExtraProps) => {
  const { src, node, ...otherProps } = props;
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);
  const loadedShaRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const selectedRepo = useRepoContextStore.getState().selectedRepo;
    const selectedFile = useFileTreeStore.getState().selectedFile;
    if (!src || !selectedRepo || !selectedFile) return;

    if (src.startsWith('http') || src.startsWith('data:')) {
      setImgSrc(src);
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      const targetPath = resolvePath(selectedFile.path, src);
      const sha = useFileTreeStore.getState().getBlobSha(targetPath);

      if (!sha) {
        if (isMounted) console.error('Image not found in tree:', targetPath);
        return;
      }

      if (sha === loadedShaRef.current) {
        setLoading(false);
        return;
      }

      loadedShaRef.current = sha;
      setLoading(true);

      try {
        const mime = getMimeType(targetPath);
        let base64Content: string;

        const cached = await getImageCache(sha);
        if (cached) {
          base64Content = cached.base64;
        } else {
          const blobRes = await githubApi.getBlob(selectedRepo.owner, selectedRepo.name, sha);
          if (!isMounted) return;
          base64Content = blobRes.content.replace(/\n/g, '');
          await setImageCache(sha, { base64: base64Content, mime });
        }

        if (!isMounted) return;

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        const res = await fetch(`data:${mime};base64,${base64Content}`);
        const blob = await res.blob();

        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        setImgSrc(objectUrl);
      } catch (error) {
        if (isMounted) console.error('Failed to load image:', src, error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <span className="!inline-block bg-slate-800/50 animate-pulse rounded text-slate-600 text-sm">
        Loading image...
      </span>
    );
  }

  return (
    <img
      src={imgSrc || ''}
      {...otherProps}
      className="!inline max-w-full h-auto"
    />
  );
};
