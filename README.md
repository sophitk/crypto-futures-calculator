# Crypto Futures Calculator

A browser-only portfolio demo for linear futures position estimates. No exchange connection or wallet integration.

## Run
Open index.html in a browser. No installation or build step is required.

## Features
- Long/short gross P/L, gross ROI, notional value and initial margin.
- Entry/exit notional-based trading fees.
- Simplified isolated liquidation estimate and input validation.

## Model and limitations
Position size is in base-asset units, not an arbitrary exchange contract count. Initial margin = entry × size / leverage. Gross P/L excludes fees and funding.

Liquidation uses entry × (1 − 1/leverage) / (1 − MMR) for long positions and entry × (1 + 1/leverage) / (1 + MMR) for shorts, with extra margin and MM deduction set to zero. This is a reduced model, not an exchange-accurate trading tool. Unsupported combinations show N/A. Fee, funding, tier, mark-price and cross/portfolio-margin effects are excluded.

Reference: [Bybit isolated linear contract formulas](https://www.bybit.com/en/help-center/article/UTA-Trading-Rules-Liquidation-Process), checked 26 October 2026. The implementation is a simplification of those formulas.

## Verify
Run: node --test tests/calculator.test.cjs

## Portfolio focus
Form UX, transparent assumptions, calculation logic and regression testing. Developed with AI assistance.

## License
MIT — see LICENSE and LICENSE-STATUS.md.
