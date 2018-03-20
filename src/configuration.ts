import * as _ from 'underscore';
import { HttpResponse } from './response';

export interface UrlCrawlingResult {
  url: string,
  status: number,
  content: string,
  error: any,
  response: HttpResponse,
  body: string,
  referer: string
}

export type successCallback = (crawlingResult: UrlCrawlingResult) => void;
export type failureCallback = (crawlingResult: UrlCrawlingResult) => void;
export type finishedCallback = (crawledUrls: string[]) => void;

export interface CrawlOptions {
  depth: number;
  ignoreRelative: boolean;
  userAgent: string;
  maxConcurrentRequests: number;
  maxRequestsPerSecond: number;
  shouldCrawl: (url: string) => boolean;
  shouldCrawlLinksFrom: (url: string) => boolean;
}

export interface CrawlCallbacks {
  success: successCallback;
  failure: failureCallback;
  finished: finishedCallback;
}

export type ConfigurationOptions = CrawlOptions & CrawlCallbacks;

const DEFAULT_DEPTH = 2;
const DEFAULT_MAX_CONCURRENT_REQUESTS = 10;
const DEFAULT_MAX_REQUESTS_PER_SECOND = 100;
const DEFAULT_USERAGENT = 'crawler/js-crawler';

const DEFAULT_OPTIONS: ConfigurationOptions = {
  depth: DEFAULT_DEPTH,
  ignoreRelative: false,
  userAgent: DEFAULT_USERAGENT,
  maxConcurrentRequests: DEFAULT_MAX_CONCURRENT_REQUESTS,
  maxRequestsPerSecond: DEFAULT_MAX_REQUESTS_PER_SECOND,
  shouldCrawl: url => true,
  shouldCrawlLinksFrom: url => true,
  success: _.noop,
  failure: _.noop,
  finished: _.noop
};

export default class Configuration {

  config: ConfigurationOptions;

  configure(options: ConfigurationOptions) {
    this.config = Object.assign({}, DEFAULT_OPTIONS, options);
    this.config.depth = Math.max(this.config.depth, 0);
  }

  get options(): CrawlOptions {
    return _.pick(this.config, [
      'depth', 'ignoreRelative', 'userAgent', 'maxConcurrentRequests', 'maxRequestsPerSecond', 'shouldCrawl', 'shouldCrawlLinksFrom'
    ]);
  }

  get callbacks(): CrawlCallbacks {
    return _.pick(this.config, [
      'success', 'failure', 'finished'
    ]);
  }

  updateAndReturnUrl(urlOrOptions: CrawlCallbacks & { url: string} | string,
      success?: successCallback,
      failure?: failureCallback,
      finished?: finishedCallback) {
    if (typeof urlOrOptions !== 'string') {
      const options: CrawlCallbacks = urlOrOptions;
      this.config = Object.assign({}, this.config, options);
      return urlOrOptions.url;
    } else {
      const url = urlOrOptions;
      const optionsUpdate = {
        success: success || _.noop,
        failure: failure || _.noop,
        finished: finished || _.noop
      };
      this.config = Object.assign({}, this.config, optionsUpdate);
      return url;
    }
  }
}