/**
 * Cavalry Fourthwall POD contribution model. All monetary inputs use the same currency.
 * Required unknown values cannot silently become zero. No external calls or sales actions.
 * Payment processor charges fees on product + paid shipping + tax (after discount).
 */
const FEES=Object.freeze({
  domestic_card:{variable:0.029,fixed:0.30},
  international_card:{variable:0.039,fixed:0.30},
  domestic_paypal:{variable:0.0349,fixed:0.49},
  international_paypal:{variable:0.0499,fixed:0.49}
});
const MONEY=['retail','production','shippingCollected','shippingPaidByMerchant',
 'taxCollected','discount','platformFees','fxFees','expectedSupportAndReturns','paidAcquisition'];
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
const valid=n=>Number.isFinite(n)&&n>=0;
export const paymentFees=FEES;
export function calculateContribution(input){
  const market=input?.market||'unknown',currency=input?.currency||'USD';
  const method=input?.paymentMethod||'domestic_card';
  if(!FEES[method])throw Error('unknown_payment_method');
  const missing=MONEY.filter(k=>!valid(input?.[k]));
  if(missing.length)return {status:'NEEDS_VERIFICATION',market,currency,missing,
    note:'Required unit economics unknown. Do not claim profit or margins.'};
  const discountedRetail=input.retail-input.discount;
  if(discountedRetail<0)throw Error('discount_exceeds_retail');
  const customerTotal=discountedRetail+input.shippingCollected+input.taxCollected;
  const processing=customerTotal*FEES[method].variable+FEES[method].fixed;
  const profit=discountedRetail+input.shippingCollected-input.production-
    input.shippingPaidByMerchant-processing-input.platformFees-input.fxFees-
    input.expectedSupportAndReturns-input.paidAcquisition;
  const cash=input.cashRequiredBeforeSettlement;
  return {status:'ESTIMATE_ONLY',market,currency,paymentMethod:method,
    customerTotal:round(customerTotal),paymentProcessing:round(processing),
    modeledContribution:round(profit),
    contributionRate:discountedRetail>0?round(profit/discountedRetail*100):null,
    meetsZeroUpfrontRule:cash===0,requiresPayoutClearance:true,readyForLaunch:false,
    warnings:[
      ...(!valid(cash)?['supplier_cashflow_not_verified']:cash>0?['violates_zero_upfront_rule']:[]),
      ...(profit<=0?['nonpositive_modeled_contribution']:[]),
      'model_does_not_verify_shipping_quality_real_demand_returns_or_merchant_eligibility'
    ]};
}
/** Catalog FROM cost is not the exact Fourthwall SKU-specific manufacturing fee. */
export const medArtResearch=Object.freeze([
 {sku:'orbit-notes-sticker',name:'Orbit Notes original sticker',retailUSD:6.29,
  publicCatalogFromUSD:2.29,baseVerified:false,status:'FOURTHWALL_HIDDEN'},
 {sku:'night-geometry-mug',name:'Night Geometry original mug',retailUSD:16.95,
  publicCatalogFromUSD:5.95,baseVerified:false,status:'FOURTHWALL_HIDDEN'},
 {sku:'contour-flow-tee',name:'Contour Flow original tee (starting retail variant)',
  retailUSD:22.75,publicCatalogFromUSD:11.75,baseVerified:false,status:'FOURTHWALL_HIDDEN'},
 {sku:'arc-study-01',name:'Arc Study 01 original geometric art',retailUSD:null,
  publicCatalogFromUSD:null,baseVerified:false,status:'ARTWORK_ONLY'}
]);
/** Optimistic illustration ONLY; omits shipping, taxes, FX, returns, production variants.
 * NOT a real verified profit and not a guaranteed ceiling when shipping markups differ.
 */
export function illustrativeCatalogSpread(item,method='domestic_card'){
  if(!FEES[method])throw Error('unknown_payment_method');
  if(!valid(item?.retailUSD)||!valid(item?.publicCatalogFromUSD))
    return {status:'UNKNOWN',reason:'retail_or_public_from_cost_missing'};
  const fee=item.retailUSD*FEES[method].variable+FEES[method].fixed;
  return {sku:item.sku,status:'ILLUSTRATION_ONLY',currency:'USD',
    illustrativeDifferenceAfterProcessing:round(item.retailUSD-item.publicCatalogFromUSD-fee),
    assumptions:'Public FROM cost only; single domestic-card transaction; no shipping, tax, FX, returns or variant differences.',
    verifiedProfit:false};
}
