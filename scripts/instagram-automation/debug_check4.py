import re, sys
sys.stdout.reconfigure(encoding='utf-8')

text = open('debug_screenshots/post_login_140324.html', encoding='utf-8')
content = text.read()
print('Page length:', len(content))

if 'password/reset' in content.lower():
    print('PASSWORD RESET PAGE')

if 'accounts/login' in content.lower():
    print('LOGIN PAGE')

# Check for heading
for m in re.finditer(r'<h[1-3][^>]*>(.*?)</h[1-3]>', content):
    h = m.group(1)
    h_clean = re.sub(r'<[^>]+>', '', h)
    if h_clean.strip():
        print('HEADING:', h_clean.encode('utf-8'))

# Check for error messages
for klass in ['error', 'alert', 'warning', 'danger']:
    for m in re.finditer(r'class="[^"]*' + klass + '[^"]*"[^>]*>(.*?)<', content):
        err = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        if err:
            print('ERROR:', err.encode('utf-8'))
