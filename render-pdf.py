from subprocess import call
import datetime
from os.path import splitext
import sys
import urllib

file_url = sys.argv[1]

name, extension = splitext(file_url)
ext = str.lower(str(extension))

new_file_name = 'document' + ext
urllib.urlretrieve(file_url, new_file_name)

# Convert the .html into a document.
call(['libreoffice', '--headless', '--invisible', '--convert-to', 'pdf', new_file_name])

# Now export it to AWS.
from ExportUtilities import ExportUtilities
print ExportUtilities.export_to_aws(
    'document.pdf', 'ocexportpdf', 'document_' + datetime.datetime.now().strftime('%s') + '.pdf')

import os
os.remove('document.pdf')
