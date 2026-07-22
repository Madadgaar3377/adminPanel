import React from 'react';
import { X } from 'lucide-react';
import {
  STEP4_SAVE_MODES,
  applyBasePricingUpdate,
  applyVariantPricingUpdate,
  deriveProductPrice,
  getBaseEffectivePrice,
  getVariantEffectivePrice,
  hasStandardVariant,
} from '../../utils/installmentAdminPlans';
import {
  PartnerStep4Tabs,
  ProductFinancePanel,
} from './InstallmentFinanceUI';
import Step4PlansBuilder from './Step4PlansBuilder';

const InputField = ({ label, value, onChange, type = 'text', placeholder = '', readOnly = false }) => (
  <div className="space-y-2">
    {label ? <label className="block text-sm font-medium text-gray-700">{label}</label> : null}
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm ${
        readOnly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white'
      }`}
    />
  </div>
);

const VariantPricingFields = ({ variant, onUpdate, calcOnly = false, compact = false }) => {
  const cashLabel = calcOnly ? 'Cash Price (calc) *' : 'Cash Price (₨) *';
  const discLabel = calcOnly ? 'Discounted Price (calc)' : 'Discounted Price (₨)';

  if (compact) {
    return (
      <>
        <InputField label={cashLabel} type="number" value={variant.price} onChange={(v) => onUpdate('price', v)} />
        <InputField label={discLabel} type="number" value={variant.discountedPrice ?? ''} onChange={(v) => onUpdate('discountedPrice', v)} placeholder="Same as cash if no discount" />
        <InputField label="Discount % (auto)" type="number" value={variant.discountPercent ?? 0} readOnly />
        <div className="flex flex-col justify-end">
          <span className="text-xs text-gray-500">Effective price</span>
          <span className="text-lg font-bold text-red-600">₨ {getVariantEffectivePrice(variant).toLocaleString()}</span>
        </div>
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <InputField label={cashLabel} type="number" value={variant.price} onChange={(v) => onUpdate('price', v)} />
      <InputField label={discLabel} type="number" value={variant.discountedPrice ?? ''} onChange={(v) => onUpdate('discountedPrice', v)} placeholder="Same as cash if no discount" />
      <InputField label="Discount % (auto)" type="number" value={variant.discountPercent ?? 0} readOnly />
      <div className="flex flex-col justify-end">
        <span className="text-xs text-gray-500">Effective price for plans</span>
        <span className="text-lg font-bold text-red-600">₨ {getVariantEffectivePrice(variant).toLocaleString()}</span>
      </div>
    </div>
  );
};

/**
 * Step 4 financial section  aligned with partner panel (variants, save modes, Step4PlansBuilder).
 */
export default function AdminInstallmentStep4({
  form,
  setForm,
  updateForm,
  step4Tab,
  setStep4Tab,
  step4SaveMode,
  setStep4SaveMode,
  selectedProductId,
  existingPlans = [],
  productId,
  showVariantSection,
}) {
  const isCashOnlyMode = step4SaveMode === STEP4_SAVE_MODES.CASH;
  const isInstallmentsOnlyMode = step4SaveMode === STEP4_SAVE_MODES.INSTALLMENTS_ONLY;
  const showPaymentPlans = !isCashOnlyMode;

  const updateVariantPricing = (vIdx, field, value) => {
    setForm((f) => {
      const nv = [...f.variants];
      nv[vIdx] = applyVariantPricingUpdate(nv[vIdx], field, value);
      return { ...f, variants: nv };
    });
  };

  const updateBasePricing = (field, value) => {
    setForm((f) => applyBasePricingUpdate(f, field, value));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">
          Step 4: Variants & Payment Plans
        </h2>
        <div className="text-right bg-gray-900 px-5 py-2 rounded-xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference cash price</p>
          <p className="text-lg font-black text-white tabular-nums">
            ₨ {deriveProductPrice(form.variants, form.price, form).toLocaleString()}
          </p>
        </div>
      </div>

      <PartnerStep4Tabs active={step4Tab} onChange={setStep4Tab} />

      {(step4Tab === 'finance' || step4Tab === 'both') && (
        <ProductFinancePanel
          finance={form.finance}
          onUpdate={(field, value) => updateForm(`finance.${field}`, value)}
        />
      )}

      {(step4Tab === 'installments' || step4Tab === 'both') && (
        <>
          <div className="p-4 bg-white border border-dashed border-blue-300 rounded-xl space-y-3">
            <p className="text-sm font-bold text-gray-800">What do you want to save?</p>
            <div className="flex flex-wrap gap-2">
              {[
                { mode: STEP4_SAVE_MODES.CASH, label: 'Cash price', active: 'bg-emerald-600 border-emerald-600 text-white', idle: 'hover:border-emerald-400' },
                { mode: STEP4_SAVE_MODES.CASH_INSTALLMENTS, label: 'Cash + installments', active: 'bg-red-600 border-red-600 text-white', idle: 'hover:border-red-300' },
                { mode: STEP4_SAVE_MODES.INSTALLMENTS_ONLY, label: 'Only installments', active: 'bg-violet-600 border-violet-600 text-white', idle: 'hover:border-violet-400' },
              ].map(({ mode, label, active, idle }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setStep4SaveMode(mode)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                    step4SaveMode === mode ? `${active} shadow-md` : `bg-white border-gray-200 text-gray-700 ${idle}`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {showVariantSection && (
            <div className="space-y-4 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedProductId ? 'Pricing on this product' : 'Product variants'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Cash price + discounted price → discount % is calculated automatically.
                  </p>
                </div>
                {selectedProductId ? (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        variants: [
                          ...f.variants,
                          {
                            variantName: '',
                            price: '',
                            discountedPrice: '',
                            discountPercent: 0,
                            status: 'active',
                            isCatalogVariant: false,
                            isPartnerOwned: true,
                          },
                        ],
                      }))
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    + Add variant
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          variants: [
                            ...f.variants,
                            { variantName: '', price: '', discountedPrice: '', discountPercent: 0, paymentPlans: [], status: 'active' },
                          ],
                        }))
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      + Add Variant
                    </button>
                    {!hasStandardVariant(form.variants) && Number(form.price) > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            variants: [
                              {
                                variantName: 'Standard',
                                price: f.price,
                                discountedPrice: f.discountedPrice || f.price,
                                discountPercent: f.discountPercent || 0,
                                paymentPlans: [],
                                status: 'active',
                              },
                              ...f.variants,
                            ],
                          }))
                        }
                        className="px-4 py-2 bg-white border border-blue-300 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-100"
                      >
                        + Add Standard (base price)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {form.variants.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  {selectedProductId
                    ? 'Add cash price below or add a variant.'
                    : 'Add at least one variant, then link each payment plan to it.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {form.variants.map((variant, vIdx) => (
                    <div key={vIdx} className="p-4 bg-white border border-gray-200 rounded-xl relative">
                      {(!selectedProductId || variant.isPartnerOwned) && (
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== vIdx) }))}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      {selectedProductId && variant.isCatalogVariant ? (
                        <div className="space-y-4">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Catalog variant</span>
                            <p className="text-base font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mt-1">
                              {variant.variantName || `Variant ${vIdx + 1}`}
                            </p>
                          </div>
                          <VariantPricingFields
                            variant={variant}
                            onUpdate={(field, value) => updateVariantPricing(vIdx, field, value)}
                            calcOnly={isInstallmentsOnlyMode}
                          />
                        </div>
                      ) : selectedProductId && variant.isPartnerOwned ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 pr-8">
                          <InputField
                            label="Variant name *"
                            value={variant.variantName}
                            onChange={(v) => {
                              const nv = [...form.variants];
                              nv[vIdx].variantName = v;
                              setForm((f) => ({ ...f, variants: nv }));
                            }}
                            placeholder="e.g. 1 TON"
                          />
                          <VariantPricingFields
                            variant={variant}
                            onUpdate={(field, value) => updateVariantPricing(vIdx, field, value)}
                            calcOnly={isInstallmentsOnlyMode}
                            compact
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 pr-8">
                          <InputField
                            label="Variant Name *"
                            value={variant.variantName}
                            onChange={(v) => {
                              const nv = [...form.variants];
                              nv[vIdx].variantName = v;
                              setForm((f) => ({ ...f, variants: nv }));
                            }}
                            placeholder="e.g. 12GB / 256GB"
                          />
                          <VariantPricingFields
                            variant={variant}
                            onUpdate={(field, value) => updateVariantPricing(vIdx, field, value)}
                            calcOnly={isInstallmentsOnlyMode}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!showVariantSection && (
            <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-4">
              <p className="text-sm font-medium text-gray-700">Product pricing</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField label="Cash Price (₨) *" type="number" value={form.price} onChange={(v) => updateBasePricing('price', v)} />
                <InputField label="Discounted Price (₨)" type="number" value={form.discountedPrice ?? ''} onChange={(v) => updateBasePricing('discountedPrice', v)} />
                <InputField label="Discount % (auto)" type="number" value={form.discountPercent ?? 0} readOnly />
                <div className="flex flex-col justify-end">
                  <span className="text-xs text-gray-500">Effective price</span>
                  <span className="text-lg font-bold text-red-600">₨ {getBaseEffectivePrice(form).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {selectedProductId && existingPlans.length === 0 && showPaymentPlans && (
            <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              No payment plans from this partner on the product yet. Save cash prices or add plans below.
            </p>
          )}

          {showPaymentPlans && (
            <Step4PlansBuilder
              form={form}
              setForm={setForm}
              productId={productId}
              selectedProductId={selectedProductId}
              existingPlans={existingPlans}
              showVariantHint={showVariantSection && form.variants.length > 0}
            />
          )}

          {isCashOnlyMode && (
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              Ready to save cash prices. Installment plans are optional.
            </p>
          )}
          {isInstallmentsOnlyMode && (
            <p className="text-sm text-violet-800 bg-violet-50 border border-violet-200 rounded-lg px-4 py-3">
              Only installment plans will be saved. Cash prices are for calculations only.
            </p>
          )}
        </>
      )}
    </div>
  );
}
