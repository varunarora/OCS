from subprocess import call
import datetime

import os
try:
	os.remove('document.odt')
except OSError:
	pass

# Convert the .tex into a document.
call(['mk4ht', 'oolatex', 'document.tex'])

# Now export it to AWS.
from ExportUtilities import ExportUtilities
print ExportUtilities.export_to_aws(
    'document.odt', 'ocexportworksheet', 'document_' + datetime.datetime.now().strftime('%s') + '.odt')

