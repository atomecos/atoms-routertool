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

  describe('#resolve()', () => {
    it('expect to resolve from method and path', () => {
      // arranges
      const router = new Router();
      const routes = {
        'GET /product': { topic: 'topic0', type: 'type0', quality: 'quality0' },
        'GET /product/:id': { topic: 'topic1', type: 'type1', quality: 'quality1' },
        'POST /product/:id': { topic: 'topic2', type: 'type2', quality: 'quality2' },
      };
      router.setRoutes(routes);

      // acts
      const result01 = router.resolve('get', '/product');
      const result02 = router.resolve('get', '/product/001');
      const result03 = router.resolve('post', '/product/abc');
      const result04 = router.resolve('get', '/task/xyz');

      // asserts
      expect(result01).to.deep.equal({ channel: { topic: 'topic0', type: 'type0', quality: 'quality0' }, value: {} });
      expect(result02).to.deep.equal({ channel: { topic: 'topic1', type: 'type1', quality: 'quality1' }, value: { id: '001' } });
      expect(result03).to.deep.equal({ channel: { topic: 'topic2', type: 'type2', quality: 'quality2' }, value: { id: 'abc' } });
      expect(result04).to.deep.equal({ channel: undefined, value: undefined });
    });
  });

  describe('#toComposing()', () => {
    it('expect to get composing function', () => {
      // arranges
      const router = new Router();

      // acts
      const composing = router.toComposing();

      // asserts
      expect(typeof composing).to.equal('function');
    });

    it('expect to execute composing', async () => {
      // arranges
      const router = new Router();
      const routes = {
        'GET /product/:id': { topic: 'topic', type: 'type', quality: 'quality' },
      };
      router.setRoutes(routes);
      const dataStub = sinon.stub().returns({ val: 'data' });
      const createActionStub = sinon.stub().returns({ val: 'action' });
      const dispatchActionOnPromiseStub = sinon.stub().resolves({ val: 'dispatchAction' });
      const ctx = {
        method: 'get',
        path: '/product/123',
        data: dataStub,
        process: {
          createAction: createActionStub,
          dispatchActionOnPromise: dispatchActionOnPromiseStub
        }
      };
      const nextStub = sinon.stub().resolves();
      const composing = router.toComposing();

      // acts
      await composing(ctx, nextStub);

      // asserts
      expect(dataStub.calledWith({ id: '123' })).to.be.true;
      expect(createActionStub.calledWith({ val: 'data' }, { topic: 'topic', type: 'type', quality: 'quality' })).to.be.true;
      expect(dispatchActionOnPromiseStub.calledWith({ val: 'action' })).to.be.true;
      expect(nextStub.called).to.be.true;
      expect(ctx.body).to.deep.equal({ val: 'dispatchAction' });
    });

    it('expect to execute composing on rejecting next()', async () => {
      // arranges
      const router = new Router();
      const routes = {
        'GET /product/:id': { topic: 'topic', type: 'type', quality: 'quality' },
      };
      router.setRoutes(routes);
      const dataStub = sinon.stub().returns({ val: 'data' });
      const createActionStub = sinon.stub().returns({ val: 'action' });
      const dispatchActionOnPromiseStub = sinon.stub().resolves({ val: 'dispatchAction' });
      const ctx = {
        method: 'get',
        path: '/product/123',
        data: dataStub,
        process: {
          createAction: createActionStub,
          dispatchActionOnPromise: dispatchActionOnPromiseStub
        }
      };
      const nextStub = sinon.stub().rejects(new Error("test"));
      const composing = router.toComposing();

      // acts
      await composing(ctx, nextStub);

      // asserts
      expect(dataStub.calledWith({ id: '123' })).to.be.true;
      expect(createActionStub.calledWith({ val: 'data' }, { topic: 'topic', type: 'type', quality: 'quality' })).to.be.true;
      expect(dispatchActionOnPromiseStub.calledWith({ val: 'action' })).to.be.true;
      expect(nextStub.called).to.be.true;
      expect(ctx.body).to.deep.equal({ val: 'dispatchAction' });
      expect(ctx.status).to.equal(500);
    });

    it('expect to execute composing on 404-Not Found', async () => {
      // arranges
      const router = new Router();
      const routes = {
        'GET /product/:id': { topic: 'topic', type: 'type', quality: 'quality' },
      };
      router.setRoutes(routes);
      const dataStub = sinon.stub().returns({ val: 'data' });
      const createActionStub = sinon.stub().returns({ val: 'action' });
      const dispatchActionOnPromiseStub = sinon.stub().resolves({ val: 'dispatchAction' });
      const ctx = {
        method: 'get',
        path: '/customer/123',
        data: dataStub,
        process: {
          createAction: createActionStub,
          dispatchActionOnPromise: dispatchActionOnPromiseStub
        }
      };
      const nextStub = sinon.stub().resolves();
      const composing = router.toComposing();

      // acts
      await composing(ctx, nextStub);

      // asserts
      expect(dataStub.called).to.be.false;
      expect(createActionStub.called).to.be.false;
      expect(dispatchActionOnPromiseStub.called).to.be.false;
      expect(nextStub.called).to.be.true;
      expect(ctx.body).to.be.undefined;
      expect(ctx.status).to.equal(404);
    });

    it('expect to execute composing on 500-Error', async () => {
      // arranges
      const router = new Router();
      const routes = {
        'GET /product/:id': { topic: 'topic', type: 'type', quality: 'quality' },
      };
      router.setRoutes(routes);
      const dataStub = sinon.stub().throws(new Error("test"));
      const createActionStub = sinon.stub().returns({ val: 'action' });
      const dispatchActionOnPromiseStub = sinon.stub().resolves({ val: 'dispatchAction' });
      const ctx = {
        method: 'get',
        path: '/product/123',
        data: dataStub,
        process: {
          createAction: createActionStub,
          dispatchActionOnPromise: dispatchActionOnPromiseStub
        }
      };
      const nextStub = sinon.stub().resolves();
      const composing = router.toComposing();

      // acts
      await composing(ctx, nextStub);

      // asserts
      expect(ctx.body).to.be.undefined;
      expect(ctx.status).to.equal(500);
    });
  });
});
