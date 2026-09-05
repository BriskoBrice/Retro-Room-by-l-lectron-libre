from pathlib import Path
import re,json,gzip,base64,hashlib,sys
bundle=Path(sys.argv[1]).read_text().strip()
p=json.loads(gzip.decompress(base64.b64decode(bundle)))
path=Path(sys.argv[2])
html=path.read_text(encoding='utf-8')
# Normalize title from public V6.27.5 or the tested V6.28.2 title.
old_titles=[p['title_old'],'<title>Retro Room V6.28.2 — FAST BIOS TEST — L’électron libre</title>']
count=sum(html.count(x) for x in old_titles)
if count!=1:
    raise SystemExit(f'Unexpected release title count: {count}')
for old in old_titles:
    html=html.replace(old,p['title_new'])

def replace_script(html,sid,block):
    pattern=rf'<script id="{re.escape(sid)}">.*?</script>'
    html2,n=re.subn(pattern,lambda _:block,html,count=1,flags=re.S)
    if n!=1: raise SystemExit(f'Cannot replace {sid}: {n}')
    return html2

# Replace scripts that already exist in V6.27.5.
for sid in ['library-plus-v59-script','three-do-core-v625-script','psx-support-v626-script']:
    html=replace_script(html,sid,p['blocks'][sid])

# Insert FAST LIBRARY plumbing before Library+.
anchor='<script id="library-plus-v59-script">'
if html.count(anchor)!=1: raise SystemExit('Library+ anchor missing/duplicate')
fastlib=p['blocks']['library-cache-v628-script']+'\n'+p['blocks']['library-folder-access-v628-script']+'\n\n'
html=html.replace(anchor,fastlib+anchor,1)

# Insert FAST BIOS in the exact stable slot between PS1 support and Virtual Boy CSS.
anchor='<style id="virtualboy-pad-v6274-style">'
if html.count(anchor)!=1: raise SystemExit('Virtual Boy anchor missing/duplicate')
pattern=r'</script>\s*'+re.escape(anchor)
replacement='</script>\n\n'+p['blocks']['fast-bios-v6282-script']+'\n\n\n'+anchor
html,n=re.subn(pattern,lambda _:replacement,html,count=1,flags=re.S)
if n!=1: raise SystemExit(f'Cannot place FAST BIOS: {n}')

actual=hashlib.sha256(html.encode()).hexdigest()
if actual!=p['expected_sha256']:
    raise SystemExit(f'SHA mismatch: {actual} != {p["expected_sha256"]}')
path.write_text(html,encoding='utf-8')
Path('README.md').write_text(p['readme'],encoding='utf-8')
Path('docs').mkdir(exist_ok=True)
Path('docs/SYSTEMS.md').write_text(p['systems'],encoding='utf-8')
Path('RELEASE_SHA256.txt').write_text(f'{actual}  index.html\n',encoding='utf-8')
print('OK',actual)
