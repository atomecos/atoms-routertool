'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const Route = require('../../dst/lib/route').Route;
const Router = require('../../dst/lib/router').Router;

describe('router.js tests', () => {
  describe('#constructor()', () => {
    it('expect to create a new instance of Router', () => {
      // arranges

      // acts
      const instance = new Router();

      // asserts
      expect(instance instanceof Router).to.be.true;
    });
  });

  describe('#setRoutes()', () => {
    it('expect to set routes', () => {
      // arranges
      const routes = {
        'GET /product': { topic: 'topic', type: 'type', quality: 'quality' },
        'GET /product/:id': { topic: 'topic', type: 'type', quality: 'quality' },
        'POST /product/:id': { topic: 'topic', type: 'type', quality: 'quality' },
        'PUT /product/:id': { topic: 'topic', type: 'type', quality: 'quality' },
      };
      const instance = new Router();

      // acts
      const length = instance.setRoutes(routes);

      // asserts
      expect(length).to.equal(4);
    });
  });

  describe('#setRoute()', () => {
    it('expect to set a route', () => {
      // arranges
      const actionPath = 'get /resolve/:id';
      const on = { topic: 'topic', type: 'type', quality: 'quality' };
      const instance = new Router();

      // acts
      const route = instance.setRoute(actionPath, on);

      // asserts
      expect(route instanceof Route).to.be.true;
    });
  });

  describe('#resolve()', () => {
    it('expect to parse from routes', () => {
      // arranges
      const router = new Router();
      const routes = {
        'GET /product': { topic: 'topic0', type: 'type0', quality: 'quality0' },
        'GET /product/:id': { topic: 'topic1', type: 'type1', quality: 'quality1' },
        'POST /product/:id': { topic: 'topic2', type: 'type2', quality: 'quality2' },
        'PUT /product/:id': { topic: 'topic3', type: 'type3', quality: 'quality3' },
      };
      router.setRoutes(routes);

      // acts
      const result01 = router.resolve('get', '/product/001');
      const result02 = router.resolve('put', '/product/abc');
      const result03 = router.resolve('put', '/task/xyz');

      // asserts
      expect(result01).to.deep.equal({ channel: { topic: 'topic1', type: 'type1', quality: 'quality1' }, value: { id: '001' } });
      expect(result02).to.deep.equal({ channel: { topic: 'topic3', type: 'type3', quality: 'quality3' }, value: { id: 'abc' } });
      expect(result03).to.be.undefined;
    });
  });
});
