# Security Configuration

## Current Security Settings

### ✅ Enabled Security Features

1. **HTTPS/TLS**
   - Minimum TLS version: 1.2
   - All traffic uses HTTPS
   - Free SSL certificate from Azure

2. **FTP Disabled**
   - FTP/FTPS completely disabled
   - Prevents insecure file transfer attacks
   - Status: `ftpsState: "Disabled"`

3. **SCM Basic Auth** (Deployment Only)
   - Enabled ONLY for GitHub Actions deployment
   - Used for publish profile authentication
   - Credentials stored securely in GitHub Secrets
   - Not exposed to public

4. **FTP Basic Auth Disabled**
   - FTP basic authentication disabled
   - Prevents brute force attacks on FTP
   - Status: `allow: false`

### 🔒 Deployment Security

**GitHub Actions Deployment:**
- Uses publish profile with basic auth for SCM
- Credentials stored as GitHub encrypted secrets
- Only accessible during deployment workflow
- Rotatable via Azure Portal

**Why SCM Basic Auth is Acceptable:**
- Only used for deployment (not public-facing)
- Protected by GitHub's secret encryption
- Alternative would be Azure Service Principal (more complex)
- Can be rotated anytime if compromised

### 🚨 Security Concerns Addressed

#### ❌ FTP with Basic Auth (FIXED)
**Problem:** FTP with basic auth is vulnerable to:
- Man-in-the-middle attacks
- Credential sniffing
- Brute force attacks

**Solution:** 
- ✅ FTP completely disabled
- ✅ FTP basic auth disabled
- ✅ Use GitHub Actions for deployment instead

#### ✅ SCM Basic Auth (Acceptable)
**Why it's OK:**
- Only for deployment endpoint (not public)
- Credentials encrypted in GitHub Secrets
- Used by trusted CI/CD pipeline
- Can upgrade to Service Principal if needed

## Recommended Security Improvements

### 1. Use Azure Service Principal (Most Secure)

Instead of publish profile, use Azure AD authentication:

```yaml
# .github/workflows/deploy-azure.yml
- name: Login to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v3
  with:
    app-name: ${{ env.WEBAPP_NAME }}
    package: .
```

**Setup:**
```bash
# Create service principal
az ad sp create-for-rbac --name "augment-api-deploy" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-augment-demo \
  --sdk-auth

# Add output to GitHub secret: AZURE_CREDENTIALS
```

### 2. Enable Application Insights

Monitor for security threats:
```bash
az monitor app-insights component create \
  --app augment-api-insights \
  --location canadacentral \
  --resource-group rg-augment-demo
```

### 3. Add IP Restrictions (Optional)

Restrict SCM access to GitHub Actions IPs:
```bash
az webapp config access-restriction add \
  --name augment-api-johnspeck \
  --resource-group rg-augment-demo \
  --rule-name "GitHub Actions" \
  --action Allow \
  --ip-address 140.82.112.0/20 \
  --priority 100 \
  --scm-site true
```

### 4. Enable Managed Identity

For accessing Azure resources securely:
```bash
az webapp identity assign \
  --name augment-api-johnspeck \
  --resource-group rg-augment-demo
```

### 5. Add CORS Restrictions

If you have a specific frontend domain:
```bash
az webapp cors add \
  --name augment-api-johnspeck \
  --resource-group rg-augment-demo \
  --allowed-origins https://yourdomain.com
```

## Security Checklist

- [x] HTTPS enabled (TLS 1.2+)
- [x] FTP disabled
- [x] FTP basic auth disabled
- [x] SCM basic auth enabled (for deployment only)
- [x] Publish profile credentials in GitHub Secrets
- [ ] Service Principal authentication (recommended upgrade)
- [ ] Application Insights monitoring
- [ ] IP restrictions on SCM
- [ ] Managed Identity for Azure resources
- [ ] CORS restrictions
- [ ] Custom domain with SSL
- [ ] Azure Key Vault for secrets

## Current Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| FTP attacks | ✅ None | FTP completely disabled |
| Credential theft | 🟡 Low | Credentials in GitHub Secrets, rotatable |
| MITM attacks | ✅ None | HTTPS enforced, TLS 1.2+ |
| DDoS | 🟡 Medium | Free tier has basic protection |
| SQL injection | ✅ None | No database, in-memory storage |
| XSS | 🟢 Low | HTML escaping in frontend |

## Incident Response

### If Publish Profile is Compromised:

1. **Regenerate credentials:**
```bash
az webapp deployment list-publishing-profiles \
  --name augment-api-johnspeck \
  --resource-group rg-augment-demo \
  --xml > new-publish-profile.xml
```

2. **Update GitHub secret** with new credentials

3. **Check deployment logs** for unauthorized deployments

### If App is Compromised:

1. **Stop the app:**
```bash
az webapp stop --name augment-api-johnspeck --resource-group rg-augment-demo
```

2. **Review logs:**
```bash
az webapp log tail --name augment-api-johnspeck --resource-group rg-augment-demo
```

3. **Redeploy from known good commit**

4. **Rotate all credentials**

## Best Practices

1. ✅ **Never commit secrets** - Use .gitignore for `*.xml`, `*.publishsettings`
2. ✅ **Use HTTPS only** - Enforce TLS 1.2+
3. ✅ **Rotate credentials** - Every 90 days or on suspicion
4. ✅ **Monitor logs** - Check for unusual activity
5. ✅ **Keep dependencies updated** - Run `npm audit` regularly
6. ✅ **Use environment variables** - For configuration, not secrets in code

## Resources

- [Azure App Service Security](https://docs.microsoft.com/azure/app-service/overview-security)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

