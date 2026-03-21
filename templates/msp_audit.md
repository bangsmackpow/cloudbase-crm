# 🛡️ MSP Infrastructure & Security Audit
**Client:** {{company_name}}
**Date:** {{current_date}} | **Version:** {{version_id}}
**Status:** 🔴 CRITICAL RISK DETECTED

---

## ## 1. Perimeter & Network Security
| Vector | Status | Finding |
| :--- | :--- | :--- |
| **Exposed Ports** | 🔴 | Open RDP (3389) detected on 64.x.x.x. High Ransomware Risk. |
| **SSL/TLS** | 🟡 | Certificate expires in 12 days; using deprecated TLS 1.1. |
| **Login Portals** | 🔴 | Unprotected /wp-admin and /owa portals found. |

---

## ## 2. Identity & Productivity (M365/Google)
* **Domain Health:** Found 3 "Ghost" users in MX records.
* **MFA Status:** ⚪ Unknown (Likely disabled based on login portal behavior).
* **DMARC/SPF:** 🔴 Missing DMARC record. High risk of email spoofing/impersonation.

---

## ## 3. The "Web Debt" (Website Opportunity)
> **Finding:** The primary marketing site is running on **PHP 7.2** (End of Life). 
> **Impact:** Any new server update from the host will likely break the site entirely.
> **Solution:** Migrate to **Cloudflare Pages** for 0-maintenance hosting.

---

## ## 4. Continuity & Backup Assessment
* **Local Backups:** Detected 'My Cloud' NAS on network. (Single point of failure).
* **Cloud Backups:** No evidence of immutable off-site backups found.
* **RTO Estimate:** 48-72 hours to recover from a total site loss.

---

## ## 5. MSP Recommendation Path
1. **Phase 1 (Immediate):** Secure the perimeter, close RDP, and enable Cloudflare WAF.
2. **Phase 2 (30 Days):** Migrate legacy hosting to CloudBase environment.
3. **Phase 3 (Ongoing):** Full Managed Services (Patching, Identity, & Monitoring).