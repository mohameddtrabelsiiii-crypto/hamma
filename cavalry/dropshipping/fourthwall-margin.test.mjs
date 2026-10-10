import assert from 'node:assert/strict';
import {calculateContribution,medArtResearch,illustrativeCatalogSpread} from './fourthwall-margin.mjs';
const base={retail:25,production:10,shippingCollected:6,shippingPaidByMerchant:6,
  taxCollected:2.5,discount:0,platformFees:0,fxFees:0,
  expectedSupportAndReturns:1,paidAcquisition:0,
  cashRequiredBeforeSettlement:0,currency:'USD',market:'US',paymentMethod:'domestic_card'};
const ok=calculateContribution(base);
assert.equal(ok.status,'ESTIMATE_ONLY');
assert.equal(ok.customerTotal,33.5);
assert.equal(ok.paymentProcessing,1.27);
assert.equal(ok.modeledContribution,12.73);
assert.equal(ok.meetsZeroUpfrontRule,true);
assert.equal(ok.readyForLaunch,false);
assert.equal(calculateContribution({...base,production:null}).status,'NEEDS_VERIFICATION');
assert.equal(calculateContribution({...base,shippingPaidByMerchant:undefined}).status,'NEEDS_VERIFICATION');
assert.equal(calculateContribution({...base,cashRequiredBeforeSettlement:4}).meetsZeroUpfrontRule,false);
assert.ok(calculateContribution({...base,cashRequiredBeforeSettlement:4}).warnings.includes('violates_zero_upfront_rule'));
assert.throws(()=>calculateContribution({...base,retail:25,discount:30}),/discount_exceeds_retail/);
assert.equal(illustrativeCatalogSpread(medArtResearch[3]).status,'UNKNOWN');
assert.equal(illustrativeCatalogSpread(medArtResearch[0]).verifiedProfit,false);
assert.equal(medArtResearch.filter(x=>x.status==='FOURTHWALL_HIDDEN').length,3);
console.log('All Fourthwall fee, unknown-cost, and zero-upfront safety checks passed');
