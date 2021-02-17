import * as queryString from 'query-string';

/**
 * Initially based on:
 *   https://github.com/slimphp/Slim/blob/3.x/Slim/Http/Uri.php
 *   license: https://github.com/slimphp/Slim/blob/3.x/LICENSE.md (MIT License)
 */
export default class Uri {
  /**
   * Uri base path
   * @private
   */
  private basePath: string = '';

  /**
   * Uri fragment string (without "" prefix)
   * @private
   */
  private fragment: string;

  /**
   * Uri user
   * @private
   */
  private host: string;

  /**
   * Uri scheme (without "://" suffix)
   * @private
   */
  private password: string;

  /**
   * Uri path
   * @private
   */
  private path: string;

  /**
   * Uri port number
   * @private
   */
  private port: number | null;

  /**
   * Uri query string (without "?" prefix)
   * @private
   */
  private query: string;

  /**
   * Uri scheme (without "://" suffix)
   * @private
   */
  private scheme: string;

  /**
   * Uri user
   * @private
   */
  private user: string;

  /**
   * @param scheme
   * @param host
   * @param port
   * @param path
   * @param query
   * @param fragment
   * @param user
   * @param password
   */
  constructor(
    scheme: string,
    host: string,
    port: number | null = null,
    path: string = '/',
    query: string | object = '',
    fragment: string = '',
    user: string = '',
    password: string = '',
  ) {
    this.scheme = this.filterScheme(scheme);
    this.host = host;
    this.port = this.filterPort(port);
    this.path = (path === null || path.length === 0) ? '/' : this.filterPath(path);
    this.query = this.filterQuery(query);
    this.fragment = this.filterFragment(fragment);
    this.user = user;
    this.password = password;
  }

  public static createFromString(uri: string): Uri {
    const parser = typeof document === 'undefined' ? new URL(uri) : document.createElement('a');
    parser.href = uri;
    return new Uri(
      parser.protocol,
      parser.hostname,
      parser.port ? parseInt(parser.port, 10) : null,
      parser.pathname,
      parser.search,
      parser.hash,
      parser.username,
      parser.password,
    );
  }

  public getAbsoluteUrl() {
    return this.toString();
  }

  public getAuthority(): string {
    const userInfo = this.getUserInfo();
    const host = this.getHost();
    const port = this.getPort();

    return `${userInfo !== '' ? `${userInfo}@` : ''}${host}${port !== null ? `:${port}` : ''}`;
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public getFragment(): string {
    return this.fragment;
  }

  public getFullPath(): string {
    const basePath = this.getBasePath();
    const path = this.getPath();
    return `${basePath}/${path.replace(/^\//, '')}`;
  }

  public getHost(): string {
    return this.host;
  }

  public getPassword(): string {
    return this.password;
  }

  public getPath(): string {
    return this.path;
  }

  public getPort(): number | null {
    return this.port && !this.hasStandardPort() ? this.port : null;
  }

  public getQuery(): string {
    return this.query;
  }

  public getQueryObject(): object {
    return queryString.parse(this.query);
  }

  public getRelativeUrl(): string {
    const fullPath = this.getFullPath();
    const query = this.getQuery();
    const fragment = this.getFragment();

    return fullPath
      + (query !== '' ? `?${query}` : '')
      + (fragment !== '' ? `#${fragment}` : '');
  }

  public getScheme(): string {
    return this.scheme;
  }

  public getUser(): string {
    return this.user;
  }

  public getUserInfo(): string {
    return `${this.user}${this.password !== '' ? `:${this.password}` : ''}`;
  }

  public toString(): string {
    const scheme = this.getScheme();
    const authority = this.getAuthority();

    return (scheme !== '' ? `${scheme}:` : '')
      + (authority !== '' ? `//${authority}` : '')
      + this.getRelativeUrl();
  }

  public withBasePath(basePath: string): Uri {
    const newUri = this.clone();
    const newBasePath = basePath.replace(/(^\/|\/$)/g, '');
    newUri.basePath = newBasePath;
    if (newBasePath !== '') {
      const filteredBasePath = this.filterPath(newBasePath);
      newUri.basePath = `/${filteredBasePath}`;
    }
    return newUri;
  }

  public withFragment(fragment: string): Uri {
    const newUri = this.clone();
    newUri.fragment = this.filterFragment(fragment);
    return newUri;
  }

  public withHost(host: string): Uri {
    const newUri = this.clone();
    newUri.host = host;
    return newUri;
  }

  public withPath(path: string): Uri {
    const newUri = this.clone();
    newUri.path = this.filterPath(path);
    return newUri;
  }

  public withPort(port: number): Uri {
    const newUri = this.clone();
    newUri.port = this.filterPort(port);
    return newUri;
  }

  public withQuery(query: string | object): Uri {
    const newUri = this.clone();
    newUri.query = this.filterQuery(query);
    return newUri;
  }

  public withScheme(scheme: string) {
    const newUri = this.clone();
    newUri.scheme = this.filterScheme(scheme);
    return newUri;
  }

  public withUserInfo(user: string, password: string | undefined = undefined) {
    const newUri = this.clone();
    newUri.user = this.filterUserInfo(user);
    newUri.password = '';
    if (this.user !== '' && password) {
      newUri.password = this.filterUserInfo(password);
    }
    return newUri;
  }

  private clone(): Uri {
    return Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this),
    );
  }

  private filterFragment(query: string | object): string {
    return (typeof query === 'object' ? '' : query).replace(/^#/, '')
      .replace(/(?:[^a-zA-Z0-9_\-.~!$&'()*+,;=%:@\\/?]+|%(?![A-Fa-f0-9]{2}))/g, encodeURIComponent);
  }

  private filterPath(path: string): string {
    return path.replace(/(?:[^a-zA-Z0-9_\-.~:@&=+$,\\/;%]+|%(?![A-Fa-f0-9]{2}))/g, encodeURIComponent);
  }

  private filterPort(port: number): number | null {
    if (port === null || (Number.isInteger(port) && port >= 1 && port <= 65535)) {
      return port;
    }

    throw new Error('Uri port must be null or an integer between 1 and 65535 (inclusive)');
  }

  private filterQuery(query: string | object): string {
    return (typeof query === 'object' ? queryString.stringify(query) : query).replace(/^\?/, '')
      .replace(/(?:[^a-zA-Z0-9_\-.~!$&'()*+,;=%:@\\/?]+|%(?![A-Fa-f0-9]{2}))/g, encodeURIComponent);
  }

  private filterScheme(scheme: string): string {
    const valid = /^(|https?)$/;
    const filteredScheme = scheme.replace(/([:/]+)$/, '');
    if (!valid.test(filteredScheme)) {
      throw new Error('Uri scheme must be one of: "", "https", "http"');
    }
    return filteredScheme;
  }

  private filterUserInfo(user: string): string {
    return user.replace(/(?:[^a-zA-Z0-9_\-.~!$&'()*+,;=]+|%(?![A-Fa-f0-9]{2}))/gu, encodeURIComponent);
  }

  private hasStandardPort(): boolean {
    return (this.scheme === 'http' && this.port === 80) || (this.scheme === 'https' && this.port === 443);
  }
}

