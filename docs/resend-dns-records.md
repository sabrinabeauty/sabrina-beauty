# Resend domain verification — DNS records to add at Fasthosts

Add these three records to `sabrinabeauty.uk`'s DNS at Fasthosts (login:
Samira's account, or the `ali@alikhan.uk` backup login). This does **not**
touch MX records or anything affecting `hello@sabrinabeauty.uk`'s existing
inbox — these are new records on a dedicated `mail.sabrinabeauty.uk`
subdomain used only for outgoing booking-alert emails.

| Type  | Name                       | Value                                                                                                                                                                                                                 | TTL  |
|-------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------|
| TXT   | `resend._domainkey.mail`   | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTjCfunW1bXSPlNN6u0YCeuIJjFfeVhdFqSfkGWDcPhM7pCi7Z0Rw0+8Q1X0Oet9xMIXVhsiZpTBpo6skc/tpMPwZ8rexCu/LfqXU8RcFaal5JUyxBQvE1hPh8RF6y23LUFQieMrF4F+vi0ifNnNS4tEK4hDFQuP2/xvu3fmVBTQIDAQAB` | Auto |
| CNAME | `rsend.mail`               | `rsend-euw1.forge.rmta.net`                                                                                                                                                                                         | Auto |
| CNAME | `send.mail`                | `send.forge.rmta.net`                                                                                                                                                                                               | Auto |

After adding, go back to [resend.com/domains](https://resend.com/domains)
→ `mail.sabrinabeauty.uk` → click **"I've added the records"** to trigger
verification (usually takes a few minutes to propagate, sometimes longer).

**Why this step can't be automated:** adding DNS records means logging into
Fasthosts, which requires entering real account credentials — that's
something I (Claude) never do, even with permission, even for a client's
own account. This is the one manual step standing between "booking alerts
work for Khando's test inbox" and "booking alerts work for Samira's real
inbox."

**Once verified**, update `lib/email.ts`'s `FROM_ADDRESS` from
`onboarding@resend.dev` to something on the verified domain, e.g.
`Sabrina Beauty Bookings <bookings@mail.sabrinabeauty.uk>` — until then,
Resend's sandbox restriction means booking alerts can only be delivered to
the Resend account owner's own email (`aliwycombe@gmail.com`), not to
`hello@sabrinabeauty.uk`.
