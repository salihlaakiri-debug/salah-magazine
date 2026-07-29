import re

text = open('debug_screenshots/post_login_140126.html', encoding='utf-8').read()
print('Page length:', len(text))

# Look for aria-labels
for m in re.finditer(r'aria-label="([^"]*)"', text):
    label = m.group(1)
    if any(k in label for k in ['New','Create','إنشاء','جديد','إضافة','منشور']):
        print('ARIA:', repr(label))

# Look for /create/ hrefs
for m in re.finditer(r'href="([^"]*create[^"]*)"', text):
    print('HREF:', m.group(1))

# Check if we're on homepage or login
if 'accounts/login' in text.lower():
    print('LOGIN PAGE DETECTED')
else:
    print('NOT on login page')

# Check for sidebar nav - look for typical instagram nav links
for m in re.finditer(r'<a[^>]*role="link"[^>]*href="([^"]+)"[^>]*>', text):
    href = m.group(1)
    if any(k in href for k in ['/', '/explore', '/reels', '/direct', '/create']):
        print('NAV LINK:', href)
