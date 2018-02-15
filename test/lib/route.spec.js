'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const InvalidValueError = require('atomservicescore').InvalidValueError;
const Route = require('../../dst/lib/route').Route;

describe('route.js tests', () => {
  describe('#Route.resolveActionPath()', () => {
    it('expect to resolve an action path', () => {
      // arranges
      const actionPath01 = 'get /test/path';
      const actionPath02 = 'Get /test/path';
      const actionPath03 = 'GET /test/path';
      const expected = { method: 'GET', path: '/test/path' };

      // acts
      const result01 = Route.resolveActionPath(actionPath01);
      const result02 = Route.resolveActionPath(actionPath02);
      const result03 = Route.resolveActionPath(actionPath03);

      // asserts
      expect(result01).to.deep.equal(expected);
      expect(result02).to.deep.equal(expected);
      expect(result03).to.deep.equal(expected);
    });

    it('expect to resolve an action path, with "DELETE" method', () => {
      // arranges
      const actionPath01 = 'del /test/path';
      const actionPath02 = 'delete /test/path';
      const expected = { method: 'DELETE', path: '/test/path' };

      // acts
      const result01 = Route.resolveActionPath(actionPath01);
      const result02 = Route.resolveActionPath(actionPath02);

      // asserts
      expect(result01).to.deep.equal(expected);
      expect(result02).to.deep.equal(expected);
    });

    it('expect to throw an instance of InvalidValueError', () => {
      // arranges
      const actionPath = 'GET/test/path';

      // acts
      const act = () => Route.resolveActionPath(actionPath);

      // asserts
      expect(act).to.throw(InvalidValueError);
    });
  });

  describe('#constructor()', () => {
    it('expect to create a route', () => {
      // arranges
      const actionPath = 'get /test/path';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };

      // acts
      const route = new Route(actionPath, on);

      // asserts
      expect(route.Method).to.equal('GET');
      expect(route.Path).to.equal('/test/path');
      expect(route.On).to.deep.equal(on);
    });
  });

  describe('#matchMethod()', () => {
    it('expect to determine if the method is matched', () => {
      // arranges
      const actionPath = 'get /test/:value';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const get = 'get';
      const put = 'put';
      const post = 'post';
      const patch = 'patch';
      const del = 'delete';

      // acts
      const result01 = route.matchMethod(get);
      const result02 = route.matchMethod(put);
      const result03 = route.matchMethod(post);
      const result04 = route.matchMethod(patch);
      const result05 = route.matchMethod(del);

      // asserts
      expect(result01).to.be.true;
      expect(result02).to.be.false;
      expect(result03).to.be.false;
      expect(result04).to.be.false;
      expect(result05).to.be.false;
    });

    it('expect to determine if the method is matched, "DELETE" method', () => {
      // arranges
      const actionPath = 'del /test/:value';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const v01 = 'del';
      const v02 = 'delete';
      const v03 = 'get';

      // acts
      const result01 = route.matchMethod(v01);
      const result02 = route.matchMethod(v02);
      const result03 = route.matchMethod(v03);

      // asserts
      expect(result01).to.be.true;
      expect(result02).to.be.true;
      expect(result03).to.be.false;
    });

    it('expect to determine if the method is matched, "ALL" method', () => {
      // arranges
      const actionPath = 'all /test/:value';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const get = 'get';
      const put = 'put';
      const post = 'post';
      const patch = 'patch';
      const del = 'delete';

      // acts
      const result01 = route.matchMethod(get);
      const result02 = route.matchMethod(put);
      const result03 = route.matchMethod(post);
      const result04 = route.matchMethod(patch);
      const result05 = route.matchMethod(del);

      // asserts
      expect(result01).to.be.true;
      expect(result02).to.be.true;
      expect(result03).to.be.true;
      expect(result04).to.be.true;
      expect(result05).to.be.true;
    });
  });

  describe('#matchPath()', () => {
    it('expect to determine if the path is matched', () => {
      // arranges
      const actionPath = 'get /test/:value';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const path01 = '/test/a';
      const path02 = '/test/1';
      const path03 = '/test/val/1';
      const path04 = '/test';
      const path05 = '/go/to';

      // acts
      const result01 = route.matchPath(path01);
      const result02 = route.matchPath(path02);
      const result03 = route.matchPath(path03);
      const result04 = route.matchPath(path04);
      const result05 = route.matchPath(path05);

      // asserts
      expect(result01).to.be.true;
      expect(result02).to.be.true;
      expect(result03).to.be.false;
      expect(result04).to.be.false;
      expect(result05).to.be.false;
    });
  });

  describe('#match()', () => {
    it('expect to determine if the method and path are matched', () => {
      // arranges
      const actionPath = 'get /:value';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const path01 = '/a';
      const path02 = '/1';

      // acts
      const result01 = route.match('get', path01);
      const result02 = route.match('get', path02);

      // asserts
      expect(result01).to.be.true;
      expect(result02).to.be.true;
    });
  });

  describe('#parseValue()', () => {
    it('expect to resolve a value', () => {
      // arranges
      const actionPath = 'get /:base/:value?';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const path01 = '/base/value';
      const path02 = '/base';
      const path03 = '/test/101/';

      // acts
      const result01 = route.parseValue(path01);
      const result02 = route.parseValue(path02);
      const result03 = route.parseValue(path03);

      // asserts
      expect(result01).to.deep.equal({ base: 'base', value: 'value' });
      expect(result02).to.deep.equal({ base: 'base', value: undefined });
      expect(result03).to.deep.equal({ base: 'test', value: '101' });
    });

    it('expect to parse "undefined" as default if the path is not matched', () => {
      // arranges
      const actionPath = 'get /';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const path01 = '/';
      const path02 = '/test';

      // acts
      const result01 = route.parseValue(path01);
      const result02 = route.parseValue(path02);

      // asserts
      expect(result01).to.deep.equal({});
      expect(result02).to.be.undefined;
    });
  });

  describe('#resolvePath()', () => {
    it('expect to resolve the value and channel', () => {
      // arranges
      const actionPath = 'get /:category/:id?';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const path01 = '/general/01';
      const path02 = '/general/02';
      const path03 = '/general';

      // acts
      const result01 = route.resolvePath(path01);
      const result02 = route.resolvePath(path02);
      const result03 = route.resolvePath(path03);

      // asserts
      expect(result01).to.deep.equal({ channel: on, value: { category: 'general', id: '01' } });
      expect(result02).to.deep.equal({ channel: on, value: { category: 'general', id: '02' } });
      expect(result03).to.deep.equal({ channel: on, value: { category: 'general', id: undefined } });
    });

    it('expect to resolve "undefined"', () => {
      // arranges
      const actionPath = 'get /general/:id?';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const route = new Route(actionPath, on);
      const path01 = '/general/01';
      const path02 = '/general';
      const path03 = '/false/path';

      // acts
      const result01 = route.resolvePath(path01);
      const result02 = route.resolvePath(path02);
      const result03 = route.resolvePath(path03);

      // asserts
      expect(result01).to.deep.equal({ channel: on, value: { id: '01' } });
      expect(result02).to.deep.equal({ channel: on, value: { id: undefined } });
      expect(result03).to.be.undefined;
    });
  });
});
