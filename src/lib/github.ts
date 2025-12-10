import { Octokit, RequestError } from 'octokit';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { useRateLimitStore } from '../stores/rateLimitStore';

type ETagCache<T> = {
  etag: string;
  data: T;
};

const getETagCache = async <T>(key: string): Promise<ETagCache<T> | null> => {
  return await idbGet(`etag:${key}`) ?? null;
};

const setETagCache = async <T>(key: string, cache: ETagCache<T>) => {
  await idbSet(`etag:${key}`, cache);
};

let octokitInstance: Octokit | null = null;

export const initOctokit = (token: string) => {
  octokitInstance = new Octokit({ auth: token });

  octokitInstance.hook.before('request', async () => {
    if (!navigator.onLine) {
      throw new Error('Browser is offline');
    }
  });

  octokitInstance.hook.after('request', async (response) => {
    updateRateLimit(response.headers);
  });

  return octokitInstance;
};

export const getOctokit = () => {
  if (!octokitInstance) {
    throw new Error('Octokit not initialized. Call initOctokit first.');
  }
  return octokitInstance;
};

export const clearOctokit = () => {
  octokitInstance = null;
};

const handleApiError = (error: unknown) => {
  // Check offline status first
  if (!navigator.onLine) {
    toast.error('You are currently offline. Please check your internet connection.');
    return;
  }

  if (error instanceof RequestError) {
    // 403: Rate Limit Exceeded
    if (error.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
      toast.error('API rate limit exceeded. Please wait and try again.');
      return;
    }
    // 401/403: Unauthorized (Token Expired or Forbidden)
    if (error.status === 401 || error.status === 403) {
      useAuthStore.getState().logout();
      return;
    }
    // 500+: Server Errors
    if (error.status >= 500) {
      toast.error('GitHub API is experiencing issues. Please try again later.');
      return;
    }
  }

  // Network Errors (often TypeError: Failed to fetch)
  if (error instanceof Error && error.message.includes('Failed to fetch')) {
    toast.error('Network connection failed. Please check your internet connection.');
    return;
  }
};

let lastPercentage: number | null = null;

const updateRateLimit = (headers: Record<string, string | number | undefined>) => {
  const remaining = headers['x-ratelimit-remaining'];
  const limit = headers['x-ratelimit-limit'];
  const reset = headers['x-ratelimit-reset'];

  if (remaining !== undefined && limit !== undefined && reset !== undefined) {
    const remainingNum = Number(remaining);
    const limitNum = Number(limit);
    const percentage = (remainingNum / limitNum) * 100;

    useRateLimitStore.getState().update(remainingNum, limitNum, Number(reset));

    const crossedBelow = (threshold: number) =>
      percentage <= threshold && (lastPercentage === null || lastPercentage > threshold);

    if (crossedBelow(1)) {
      toast.error(`API rate limit critical: ${remainingNum} requests remaining`);
    } else if (crossedBelow(10)) {
      toast.warning(`API rate limit low: ${remainingNum} requests remaining`);
    }

    lastPercentage = percentage;
  }
};

export type GitTreeItem = {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
};

export type GitTreeResponse = {
  items: GitTreeItem[];
  truncated: boolean;
};

export type GitBlobResponse = {
  content: string;
  sha: string;
};

export type GitRepoResponse = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  isPrivate: boolean;
  defaultBranch: string;
};

export const githubApi = {
  async getTree(owner: string, repo: string, branch: string): Promise<GitTreeResponse> {
    const octokit = getOctokit();
    const cacheKey = `tree:${owner}/${repo}:${branch}`;
    const cached = await getETagCache<GitTreeResponse>(cacheKey);

    try {
      const { data, headers } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: 'true',
        headers: cached?.etag ? { 'If-None-Match': cached.etag } : undefined,
      });

      const items: GitTreeItem[] = data.tree
        .filter((item): item is typeof item & { path: string; sha: string } =>
          item.path !== undefined &&
          item.sha !== undefined &&
          (item.type === 'blob' || item.type === 'tree')
        )
        .map((item) => ({
          path: item.path,
          type: item.type as 'blob' | 'tree',
          sha: item.sha,
        }));

      const result: GitTreeResponse = {
        items,
        truncated: data.truncated ?? false,
      };

      if (result.truncated) {
        toast.info('Repository is too large. Only partial file tree is displayed.');
      }

      if (headers.etag) {
        await setETagCache(cacheKey, { etag: headers.etag, data: result });
      }

      return result;
    } catch (error) {
      if (error instanceof RequestError && error.status === 304 && cached) {
        return cached.data;
      }
      handleApiError(error);
      throw error;
    }
  },

  async getBlob(owner: string, repo: string, fileSha: string): Promise<GitBlobResponse> {
    try {
      const octokit = getOctokit();
      const { data } = await octokit.rest.git.getBlob({
        owner,
        repo,
        file_sha: fileSha,
      });

      return {
        content: data.content,
        sha: data.sha,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async listRepos(): Promise<GitRepoResponse[]> {
    try {
      const octokit = getOctokit();

      const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
        visibility: 'all',
        sort: 'full_name',
        per_page: 100,
      });

      return repos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        isPrivate: repo.private,
        defaultBranch: repo.default_branch,
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async getLastCommitDate(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const octokit = getOctokit();
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        path,
        per_page: 1,
      });

      return data[0]?.commit.committer?.date ?? null;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async listBranches(owner: string, repo: string): Promise<string[]> {
    try {
      const octokit = getOctokit();

      const branches = await octokit.paginate(octokit.rest.repos.listBranches, {
        owner,
        repo,
        per_page: 100,
      });

      return branches.map((branch) => branch.name);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
