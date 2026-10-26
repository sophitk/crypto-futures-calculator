const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(values = {}) {
  const defaults = {entryPrice:'20000',exitPrice:'23000',positionSize:'0.5',leverage:'10',feeRate:'0.1',maintenanceMargin:'0.5',positionDirection:'long',...values};
  const elements = new Map();
  const context = vm.createContext({document:{getElementById(id){
    if (!elements.has(id)) elements.set(id,{value:defaults[id] ?? '',textContent:'',addEventListener(){},checkValidity(){return this.value !== '';},reportValidity(){}});
    return elements.get(id);
  }},window:{addEventListener(){}}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','script.js'),'utf8'),context);
  return {context,elements};
}
test('isolated long and short use initial margin, not MMR multiplied by leverage',()=>{
  const {context}=load();
  assert.ok(Math.abs(context.calculateLiquidationPrice(20000,10,0.005,'long')-18090.45226130653)<1e-8);
  assert.ok(Math.abs(context.calculateLiquidationPrice(20000,10,0.005,'short')-21890.54726368159)<1e-8);
  assert.ok(context.calculateLiquidationPrice(20000,20,0.005,'long') > context.calculateLiquidationPrice(20000,10,0.005,'long'));
});
test('zero maintenance rate and unsupported margin combinations',()=>{
  const {context}=load();
  assert.equal(context.calculateLiquidationPrice(100,10,0,'long'),90);
  assert.equal(context.calculateLiquidationPrice(100,10,0.1,'long'),null);
  assert.equal(context.calculateLiquidationPrice(100,0,0.005,'long'),null);
  assert.equal(context.calculateLiquidationPrice(100,10,0.005,'invalid'),null);
});
test('gross P/L, ROI and entry/exit fees for an independent reference scenario',()=>{
  const {context,elements}=load();context.calculate();
  assert.equal(elements.get('pnl').textContent,'$1,500.00 (long)');
  assert.equal(elements.get('roi').textContent,'150.00 %');
  assert.equal(elements.get('fees').textContent,'$21.50');
});
test('invalid numeric input clears prior results',()=>{
  const {context,elements}=load({entryPrice:'abc'});context.calculate();
  assert.equal(elements.get('pnl').textContent,'Invalid input');
});
