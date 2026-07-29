import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
os.environ['PYTHONIOENCODING'] = 'utf-8'

text = open(r'debug_screenshots/post_login_140126.html', encoding='utf-8').read()
print('Page length:', len(text))

aria_matches = list(re.finditer(r'aria-label="([^"]*)"', text))
print(f'Total aria-labels: {len(aria_matches)}')

for m in aria_matches:
    label = m.group(1)
    for k in ['New', 'Create', 'إنشاء', 'جديد', 'إضافة', 'منشور', 'plus', 'Plus', '+']:
        if k in label:
            print('ARIA:', label.encode('utf-8'))

href_matches = list(re.finditer(r'href="([^"]*create[^"]*)"', text))
print(f'Create HREFs: {len(href_matches)}')
for m in href_matches:
    print('HREF:', m.group(1).encode('utf-8'))

# All nav links
link_matches = list(re.finditer(r'<a\s+[^>]*role="link"[^>]*href="([^"]+)"', text))
print(f'\nNav links: {len(link_matches)}')
for m in link_matches:
    href = m.group(1)
    if any(k in href for k in ['/', '/explore', '/reels', '/direct', '/create']):
        print('NAV:', href.encode('utf-8'))

# Check for login
if 'accounts/login' in text.lower():
    print('LOGIN PAGE')
else:
    print('HOMEPAGE (not login)')
