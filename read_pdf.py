import sys
import subprocess

try:
    import pypdf
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pypdf', '--break-system-packages'])
    import pypdf

reader = pypdf.PdfReader('吴昊_简历_AI产品经理_2.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"
print(text)
