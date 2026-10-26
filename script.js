const entryPriceInput = document.getElementById('entryPrice');
const exitPriceInput = document.getElementById('exitPrice');
const positionSizeInput = document.getElementById('positionSize');
const leverageInput = document.getElementById('leverage');
const feeRateInput = document.getElementById('feeRate');
const maintenanceMarginInput = document.getElementById('maintenanceMargin');
const directionInput = document.getElementById('positionDirection');
const calculateButton = document.getElementById('calculateButton');

const notionalValueOutput = document.getElementById('notionalValue');
const initialMarginOutput = document.getElementById('initialMargin');
const pnlOutput = document.getElementById('pnl');
const roiOutput = document.getElementById('roi');
const feesOutput = document.getElementById('fees');
const liquidationPriceOutput = document.getElementById('liquidationPrice');

function formatCurrency(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatPercent(value) {
  return `${value.toFixed(2)} %`;
}

function calculate() {
  const fields = [entryPriceInput, exitPriceInput, positionSizeInput, leverageInput, feeRateInput, maintenanceMarginInput];
  if (fields.some(field => !field.checkValidity() || field.value.trim() === '' || !Number.isFinite(Number(field.value)))) {
    fields.forEach(field => field.reportValidity());
    [notionalValueOutput, initialMarginOutput, pnlOutput, roiOutput, feesOutput, liquidationPriceOutput].forEach(output => output.textContent = 'Invalid input');
    return;
  }
  const entryPrice = Number(entryPriceInput.value);
  const exitPrice = parseFloat(exitPriceInput.value) || 0;
  const positionSize = parseFloat(positionSizeInput.value) || 0;
  const leverage = parseFloat(leverageInput.value) || 1;
  const feeRate = parseFloat(feeRateInput.value) / 100 || 0;
  const maintenanceMarginRate = parseFloat(maintenanceMarginInput.value) / 100 || 0;
  const direction = directionInput.value;

  const notionalValue = entryPrice * positionSize;
  const initialMargin = notionalValue / leverage;
  const priceDiff = (exitPrice - entryPrice) * (direction === 'long' ? 1 : -1);
  const pnl = priceDiff * positionSize;
  const grossRoi = initialMargin !== 0 ? (pnl / initialMargin) * 100 : 0;
  const fees = (entryPrice + exitPrice) * positionSize * feeRate;
  const maintenanceMargin = notionalValue * maintenanceMarginRate;

  const liquidationPrice = calculateLiquidationPrice(
    entryPrice,
    leverage,
    maintenanceMarginRate,
    direction
  );

  notionalValueOutput.textContent = formatCurrency(notionalValue);
  initialMarginOutput.textContent = formatCurrency(initialMargin);
  pnlOutput.textContent = `${formatCurrency(pnl)} (${direction === 'long' ? 'long' : 'short'})`;
  roiOutput.textContent = `${grossRoi.toFixed(2)} %`;
  feesOutput.textContent = formatCurrency(fees);
  liquidationPriceOutput.textContent = liquidationPrice ? formatCurrency(liquidationPrice) : 'N/A';
}

function calculateLiquidationPrice(entryPrice, leverage, maintenanceMarginRate, direction) {
  if (![entryPrice, leverage, maintenanceMarginRate].every(Number.isFinite) ||
      entryPrice <= 0 || leverage < 1 || maintenanceMarginRate < 0 ||
      maintenanceMarginRate >= 1 || maintenanceMarginRate >= 1 / leverage ||
      !['long', 'short'].includes(direction)) return null;
  // Reduced isolated linear model; see README for assumptions and exclusions.
  return direction === 'long'
    ? entryPrice * (1 - 1 / leverage) / (1 - maintenanceMarginRate)
    : entryPrice * (1 + 1 / leverage) / (1 + maintenanceMarginRate);
}

calculateButton.addEventListener('click', calculate);
window.addEventListener('load', calculate);
