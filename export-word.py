from subprocess import call
import datetime

# Convert the .html into a document.
call(['libreoffice', '--headless', '--invisible', '--convert-to', 'odt', 'document.html'])

# Now export it to AWS.
from ExportUtilities import ExportUtilities
print ExportUtilities.export_to_aws(
    'document.odt', 'ocexportword', 'document_' + datetime.datetime.now().strftime('%s') + '.odt')

import os
os.remove('document.odt')

