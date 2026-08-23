# COMPLIANCE-REVIEW.md — Numeric & Legal Claims Audit
*Generated 2026-08-23. Every specific numeric/legal claim across 4 compliance-sensitive repos.*
*Give this file to ONE licensed accountant/CPA for a single review pass.*

---

## CRITICAL DISCREPANCY FOUND (fix before merging to main)

### PayslipPH — Statutory Rate Mismatch
The input defaults and hint text in `index.html` disagree on current statutory rates:

| Rate | Input Default | Hint Text | Which is current 2026? |
|------|--------------|-----------|----------------------|
| SSS Employee % | **4.5%** | **3.63%** | NEEDS VERIFICATION |
| PhilHealth Employee % | **2.5%** | **1.25%** | NEEDS VERIFICATION |
| Pag-IBIG Employee % | **2%** | **1%** | NEEDS VERIFICATION |
| SSS MSC Cap | **₱35,000** | **₱34,999** | Rounding difference |

**Action needed:** Allen's accountant should confirm which set is correct for 2026, then we update the mismatched values.

---

## ALL HARDCODED RATES BY REPO

### InvoicePH
| Claim | Value | File | Legal Basis |
|-------|-------|------|-------------|
| VAT rate | 12% | app.js:64-65 | NIRC (EVAT) |
| CWT on services | 2% | index.html:115, app.js:68-70 | BIR Form 2307 |
| CWT on goods | 1% | index.html:116 | BIR Form 2307 |
| CWT gov't/other | 5% | index.html:117 | BIR Form 2307 |
| Non-VAT threshold | ₱3M | index.html:67,207 | NIRC |
| EOPT effective date | April 27, 2024 | index.html:24,199 | BIR RR 11-2024 |
| Invoice format rules | RR 11-2024 | index.html:7,46 | BIR RR 11-2024 |

### TaxCalcPH
| Claim | Value | File | Legal Basis |
|-------|-------|------|-------------|
| 8% flat rate | 8% | app.js:51 | R.A. 10963 (TRAIN) |
| ₱250k exemption | ₱250,000 | app.js:18 | R.A. 10963 (TRAIN) |
| OSD rate | 40% | app.js:19 | R.A. 10963 (TRAIN) |
| 8% eligibility cap | ₱3,000,000 | app.js:20 | R.A. 10963 (TRAIN) |
| VAT threshold | ₱3,000,000 | app.js:21 | NIRC |
| Percentage tax | 3% | app.js:57 | NIRC Sec. 116 / BIR 2551Q |
| ₱90k 13th-mo exemption | ₱90,000 | app.js:62 | R.A. 10963 (TRAIN) |
| Graduated brackets (annual) | 0%/15%/20%/25%/30%/35% | app.js:10-17 | R.A. 10963 (TRAIN) |
| Bracket breakpoints | ₱250k/₱400k/₱800k/₱2M/₱8M | app.js:10-17 | R.A. 10963 (TRAIN) |
| Base tax amounts | ₱0/₱22.5k/₱102.5k/₱402.5k/₱2.2025M | app.js:10-17 | R.A. 10963 (TRAIN) |
| Mixed income rule | ₱250k exemption on salary side only | app.js:51-52 | R.A. 10963 / RMO 23-2018 |
| Quarterly form | BIR 1701Q | index.html:154, app.js:254 | BIR Form 1701Q |

### PayslipPH
| Claim | Value | File | Legal Basis |
|-------|-------|------|-------------|
| SSS Employee % | 4.5% (default) | index.html:84 | SSS law (RA 11199) |
| SSS MSC floor | ₱5,000 | index.html:91 | SSS law |
| SSS MSC cap | ₱35,000 | index.html:92 | SSS law |
| PhilHealth Employee % | 2.5% (default) | index.html:85 | PhilHealth law (RA 11223) |
| PhilHealth MSC floor | ₱10,000 | app.js:17 | PhilHealth law |
| PhilHealth MSC cap | ₱100,000 | app.js:17 | PhilHealth law |
| Pag-IBIG Employee % | 2% (default) | index.html:86 | Pag-IBIG law (HDMF) |
| Pag-IBIG MSC cap | ₱10,000 | index.html:87 | Pag-IBIG law |
| Employer SSS | 9.5% + ₱30 ECC | app.js:52 | SSS law |
| Employer PhilHealth | = employee share | app.js:53 | PhilHealth law |
| Employer Pag-IBIG | 2% | app.js:54 | Pag-IBIG law |
| Overtime rate | 125% | app.js:37 | Labor Code |
| Working days/month | 26 | app.js:36 | Labor Code |
| Hours/day | 8 | app.js:36 | Labor Code |
| 13th month formula | basic ÷ 12 | app.js:75 | P.D. 851 |
| 13th month tax exemption | ₱90,000 | index.html:161 | R.A. 10963 (TRAIN) |
| Monthly withholding brackets | 0%/20%/25%/30%/32%/35% | app.js:9-16 | R.A. 10963 (TRAIN) |
| Withholding breakpoints | ₱20,832/₱33,332/₱66,666/₱166,666/₱666,666 | app.js:9-16 | R.A. 10963 (TRAIN) |

### CommissionPH
| Claim | Value | File | Legal Basis |
|-------|-------|------|-------------|
| 2307 withholding on brokers | 5% | app.js:30, index.html:94 | BIR RR 2-98 |
| VAT rate | 12% | app.js:29 | NIRC (EVAT) |
| Percentage tax (non-VAT) | 3% | index.html:25 | NIRC Sec. 116 |
| 8% option replaces % tax | Yes | index.html:25 | R.A. 10963 (TRAIN) |
| Typical commission rates | 3-6% | index.html:57 | Industry practice |
| Typical co-broke split | 50/50 | index.html:72-75 | Industry practice |
| Typical broker-of-record cut | 20-40% | index.html:80-83 | Industry practice |

---

## ACCOUNTANT CHECKLIST

- [ ] **PayslipPH SSS rate**: Is employee share 4.5% or 3.63% for 2026?
- [ ] **PayslipPH PhilHealth rate**: Is employee share 2.5% or 1.25% for 2026?
- [ ] **PayslipPH Pag-IBIG rate**: Is employee share 2% or 1% for 2026?
- [ ] **PayslipPH SSS MSC cap**: Is it ₱35,000 or ₱34,999?
- [ ] **PayslipPH Employer SSS**: Is 9.5% + ₱30 ECC correct for 2026?
- [ ] **PayslipPH Employer Pag-IBIG**: Is 2% correct for 2026?
- [ ] **TaxCalcPH TRAIN brackets**: Are the 6 annual brackets and base tax amounts correct?
- [ ] **TaxCalcPH monthly withholding**: Are the 6 monthly brackets correct?
- [ ] **TaxCalcPH ₱90k exemption**: Is this still the current cap?
- [ ] **TaxCalcPH ₱250k/₱3M thresholds**: Any legislative changes?
- [ ] **InvoicePH CWT rates**: Are 1%/2%/5% the current schedule?
- [ ] **CommissionPH 5% withholding**: Is this correct for individual real estate brokers under current RR?
- [ ] **All repos**: Any 2026 legislative changes not yet reflected?

---

## NOTES
- This file lists claims as found in code. No figures were changed during this audit.
- Industry practice items (commission splits, typical rates) are not regulatory — they're market norms.
- The "hint text" vs "input default" discrepancy in PayslipPH may be intentional (hint = old rate, input = updated rate) but should be confirmed.
