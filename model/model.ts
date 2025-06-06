export interface SearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: SearchResultMusicItem[];
}

export interface SearchResultMusicItem {
  id: {
    kind: string;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {url: string; width: number; height: number};
      medium: {url: string; width: number; height: number};
      high: {url: string; width: number; height: number};
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}
