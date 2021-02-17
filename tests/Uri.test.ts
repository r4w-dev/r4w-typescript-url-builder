import Uri from '../src/Uri';

const scheme = 'https';
const host = 'example.com';
const port = 443;
const path = '/foo/bar';
const query = 'abc=123';
const fragment = 'section3';
const user = 'test';
const password = 'Test123';

export interface UriFactoryProps {
  fragment?: string
  host?: string
  password?: string
  path?: string
  port?: number | undefined
  query?: string | object
  scheme?: string
  user?: string
}

const uriFactory = (opts: UriFactoryProps = {}): Uri => new Uri(
  opts.scheme ?? scheme,
  opts.host ?? host,
  opts.port ?? port,
  opts.path ?? path,
  opts.query ?? query,
  opts.fragment ?? fragment,
  opts.user ?? user,
  opts.password ?? password,
);

test('Get schema returns construct scheme', () => {
  expect(uriFactory().getScheme()).toBe(scheme);
});

test('With schema returns new scheme without affecting the original object', () => {
  const uri = uriFactory();
  const uri2 = uri.withScheme('http');
  expect(uri.getScheme()).toBe(scheme);
  expect(uri2.getScheme()).toBe('http');
});

test('With schema removes suffix', () => {
  const uri = uriFactory().withScheme('http://');
  expect(uri.getScheme()).toBe('http');
});

test('Should throw an error if called with an invalid scheme', () => {
  expect(() => (uriFactory().withScheme('ftp'))).toThrow();
});

test('Get authority with username and password', () => {
  expect(uriFactory().getAuthority()).toBe('test:Test123@example.com');
});

test('Get authority with username', () => {
  expect(uriFactory({ password: '' }).getAuthority()).toBe('test@example.com');
});

test('Get authority', () => {
  expect(uriFactory({ password: '', user: '' }).getAuthority()).toBe('example.com');
});

test('Get authority with non standard port', () => {
  expect(uriFactory({ password: '', port: 400, user: '' }).getAuthority()).toBe('example.com:400');
});

test('Get user info with user and password', () => {
  expect(uriFactory().getUserInfo()).toBe('test:Test123');
});

test('Get user info with user', () => {
  expect(uriFactory({ password: '' }).getUserInfo()).toBe('test');
});

test('Get user info with none', () => {
  expect(uriFactory({ password: '', user: '' }).getUserInfo()).toBe('');
});

test('Get user info with username and password encodes correctly', () => {
  const uri = Uri.createFromString('https://bob%40example.com:pass%3Aword@example.com:443/foo/bar?abc=123#section3');
  expect(uri.getUserInfo()).toBe('bob%40example.com:pass%3Aword');
});

test('With user info', () => {
  const uri = uriFactory().withUserInfo('bob', 'pass');
  expect(uri.getUser()).toBe('bob');
  expect(uri.getPassword()).toBe('pass');
});

test('With user info encodes correctly', () => {
  const uri = uriFactory().withUserInfo('bob@example.com', 'pass:wo:rd');
  expect(uri.getUser()).toBe('bob%40example.com');
  expect(uri.getPassword()).toBe('pass%3Awo%3Ard');
});

test('With user info removes password', () => {
  const uri = uriFactory().withUserInfo('bob');
  expect(uri.getUser()).toBe('bob');
  expect(uri.getPassword()).toBe('');
});

test('With user info removes info', () => {
  const uri = uriFactory();
  expect(uri.withUserInfo('').getUser()).toBe('');
  expect(uri.getUser()).toBe('test');
  expect(uri.withUserInfo('').getPassword()).toBe('');
  expect(uri.getPassword()).toBe('Test123');
});

test('Get host', () => {
  expect(uriFactory().getHost()).toBe('example.com');
});

test('Get host', () => {
  expect(uriFactory().withHost('example2.com').getHost()).toBe('example2.com');
});

test('Get port with scheme and non default port', () => {
  const uri = new Uri('https', 'www.example.com', 4000);
  expect(uri.getPort()).toBe(4000);
});

test('Get port with scheme and default port', () => {
  const uri1 = new Uri('http', 'www.example.com', 80);
  expect(uri1.getPort()).toBe(null);
  const uri2 = new Uri('https', 'www.example.com', 443);
  expect(uri2.getPort()).toBe(null);
});

test('Get port without scheme and port', () => {
  const uri = new Uri('', 'www.example.com');
  expect(uri.getPort()).toBe(null);
});

test('Get port with scheme without port', () => {
  const uri = new Uri('http', 'www.example.com');
  expect(uri.getPort()).toBe(null);
});

test('With port', () => {
  expect(uriFactory().withPort(8000).getPort()).toBe(8000);
});

test('With port null', () => {
  expect(uriFactory().withPort(null).getPort()).toBe(null);
});

test('With port invalid int', () => {
  expect(() => (uriFactory().withPort(70000).getPort())).toThrow();
});

test('Get base path none', () => {
  expect(uriFactory().getBasePath()).toBe('');
});

test('With base path', () => {
  expect(uriFactory().withBasePath('/base').getBasePath()).toBe('/base');
});

test('With base path adds prefix', () => {
  expect(uriFactory().withBasePath('base').getBasePath()).toBe('/base');
});

test('With base path ignores slash', () => {
  expect(uriFactory().withBasePath('/').getBasePath()).toBe('');
});

test('Get path', () => {
  expect(uriFactory().getPath()).toBe('/foo/bar');
});

test('With path', () => {
  expect(uriFactory().withPath('/new').getPath()).toBe('/new');
});

test('With path without prefix', () => {
  expect(uriFactory().withPath('new').getPath()).toBe('new');
});

test('With path empty value', () => {
  expect(uriFactory().withPath('').getPath()).toBe('');
});

test('With path url encodes input', () => {
  expect(uriFactory().withPath('/includes?/new').getPath()).toBe('/includes%3F/new');
});

test('With path does not double encode input', () => {
  expect(uriFactory().withPath('/include%25s/new').getPath()).toBe('/include%25s/new');
});

test('Get query', () => {
  expect(uriFactory().getQuery()).toBe('abc=123');
});

test('Get query', () => {
  expect(uriFactory().withQuery('xyz=123').getQuery()).toBe('xyz=123');
});

test('With query removes prefix', () => {
  expect(uriFactory().withQuery('?xyz=123').getQuery()).toBe('xyz=123');
});

test('With query empty', () => {
  expect(uriFactory().withQuery('').getQuery()).toBe('');
});

test('Filter query', () => {
  expect(uriFactory().withQuery('?foobar=%match').getQuery()).toBe('foobar=%25match');
});

test('Get fragment', () => {
  expect(uriFactory().getFragment()).toBe('section3');
});

test('With fragment', () => {
  expect(uriFactory().withFragment('other-fragment').getFragment()).toBe('other-fragment');
});

test('With fragment removes prefix', () => {
  expect(uriFactory().withFragment('#other-fragment').getFragment()).toBe('other-fragment');
});

test('With fragment empty', () => {
  expect(uriFactory().withFragment('').getFragment()).toBe('');
});

test('Absolute url', () => {
  const uri = uriFactory();
  expect(uri.getAbsoluteUrl()).toBe('https://test:Test123@example.com/foo/bar?abc=123#section3');
  const uri2 = uri.withPath('bar');
  expect(uri2.getAbsoluteUrl()).toBe('https://test:Test123@example.com/bar?abc=123#section3');
  const uri3 = uri2.withBasePath('foo/');
  expect(uri3.getAbsoluteUrl()).toBe('https://test:Test123@example.com/foo/bar?abc=123#section3');
});

test('To string', () => {
  const uri = uriFactory();
  expect(uri.toString()).toBe('https://test:Test123@example.com/foo/bar?abc=123#section3');
  const uri2 = uri.withPath('bar');
  expect(uri2.toString()).toBe('https://test:Test123@example.com/bar?abc=123#section3');
  const uri3 = uri2.withBasePath('foo/');
  expect(uri3.toString()).toBe('https://test:Test123@example.com/foo/bar?abc=123#section3');
});

test('Relative url', () => {
  const uri = uriFactory();
  expect(uri.getRelativeUrl()).toBe('/foo/bar?abc=123#section3');
  const uri2 = uri.withPath('bar');
  expect(uri2.getRelativeUrl()).toBe('/bar?abc=123#section3');
  const uri3 = uri2.withBasePath('foo/');
  expect(uri3.getRelativeUrl()).toBe('/foo/bar?abc=123#section3');
});

test('Full path', () => {
  const uri = uriFactory();
  expect(uri.getFullPath()).toBe('/foo/bar');
  const uri2 = uri.withPath('bar');
  expect(uri2.getFullPath()).toBe('/bar');
  const uri3 = uri2.withBasePath('foo/');
  expect(uri3.getFullPath()).toBe('/foo/bar');
});

test('Create from string', () => {
  const uri = Uri.createFromString('https://example.com:8080/foo/bar?abc=123');
  expect(uri.getScheme()).toBe('https');
  expect(uri.getHost()).toBe('example.com');
  expect(uri.getPort()).toBe(8080);
  expect(uri.getPath()).toBe('/foo/bar');
  expect(uri.getQuery()).toBe('abc=123');
});

test('Uri distinguish zero from empty string', () => {
  expect(Uri.createFromString('https://0:0@0a:1/0?0#0').toString()).toBe('https://0:0@0a:1/0?0#0');
});

test('Constructor with empty path', () => {
  const uri = new Uri('https', 'example.com', null, '');
  expect(uri.getPath()).toBe('/');
});

test('Constructor with zero as path', () => {
  const uri = new Uri('https', 'example.com', null, '0');
  expect(uri.getPath()).toBe('0');
});

test('It will accept objects for query', () => {
  const uri = uriFactory({ query: { a: '1[]', c: '3' } });
  expect(uri.getQuery()).toBe('a=1%5B%5D&c=3');
});

test('It will accept objects for query', () => {
  expect(uriFactory().withQuery({ a: '1[]', c: '3' }).getQuery()).toBe('a=1%5B%5D&c=3');
});

test('It will return query object', () => {
  const uri = uriFactory({ query: { a: '1[]', c: '3' } });
  expect(uri.getQueryObject()).toEqual({ a: '1[]', c: '3' });
});

test('It should be able to remove the base path', () => {
  const uri = uriFactory().withBasePath('meh');
  expect(uri.toString()).toEqual('https://test:Test123@example.com/meh/foo/bar?abc=123#section3');
  expect(uri.withBasePath('').toString()).toEqual('https://test:Test123@example.com/foo/bar?abc=123#section3');
});

