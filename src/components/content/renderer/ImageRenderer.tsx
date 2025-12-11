import { useEffect, useState, useRef, useMemo } from "react";
import { get as idbGet, set as idbSet } from 'idb-keyval';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { useRepoContextStore } from "../../../stores/repoContextStore";
import { useFileTreeStore, findNodeByPath } from "../../../stores/fileTreeStore";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { src, node, ...otherProps } = props;
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const loadedShaRef = useRef<string | null>(null);

  const selectedRepo = useRepoContextStore(s => s.selectedRepo);
  const selectedFile = useFileTreeStore(s => s.selectedFile);

  // Compute the target path for the image
  const targetPath = useMemo(() => {
    if (!src || !selectedFile) return null;
    if (src.startsWith('http') || src.startsWith('data:')) return null;
    return resolvePath(selectedFile.path, src);
  }, [src, selectedFile]);

  // Subscribe to the SHA of the target file
  const sha = useFileTreeStore(s => {
    if (!targetPath) return null;
    return findNodeByPath(s.files, targetPath)?.sha ?? null;
  });

  useEffect(() => {
    let isMounted = true;

    if (!src) return;

    if (src.startsWith('http') || src.startsWith('data:')) {
      setImgSrc(src);
      setLoading(false);
      return;
    }

    if (!selectedRepo || !targetPath || !sha) {
      if (isMounted && targetPath) {
        // Only log if we have a target path but found no SHA (file not in tree yet)
        // If it's still loading initially, this might be temporary.
        console.warn('Image not found in tree or tree not ready:', targetPath);
      }
      return;
    }

    // If we have already loaded this exact SHA, don't reload
    if (sha === loadedShaRef.current) {
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
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
  }, [src, selectedRepo, targetPath, sha]);

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
    <>
      <img
        src={imgSrc || ''}
        {...otherProps}
        className="!inline max-w-full h-auto cursor-zoom-in"
        onClick={() => setOpen(true)}
      />
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: imgSrc || '', alt: otherProps.alt }]}
        plugins={[Zoom]}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </>
  );
};
