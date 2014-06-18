from weasyprint import HTML, CSS

document = open('document.html', 'r').read()

# Traverse document and find the colwidth %s and round-up.
from bs4 import BeautifulSoup as bs
dom = bs(document)

cols = dom.find_all('col')

new_styles = {}
col_num = 0

for col in cols:
    col_style = col.get('style')
    col_styles = col_style.split(';')

    new_colstyles = {}

    for prop in col_styles:
        propertyValue = [x.strip() for x in prop.split(':')]
        value = propertyValue[1]

        if '%' in value:
            value = int(float(value[:value.index('%')]))
            unit = '%'

        elif 'px':
            value = int(float(value[:value.index('px')]))
            unit = 'px'

        elif 'em':
            value = int(float(value[:value.index('em')]))
            unit = 'px'

        new_colstyles[propertyValue[0]] = str(value) + unit

    col_class = 'col-' + str(col_num)
    new_styles['col.' + col_class] = {}

    for key in new_colstyles:
        new_styles['col.' + col_class][key] = new_colstyles[key]

    col['class'] = col_class
    del col['style']
    col_num += 1


new_styles_string = ''
for key in new_styles:
    new_styles_string += key + "{"
    for style in new_styles[key]:
        new_styles_string += style + ': ' +  new_colstyles[style] +';'

    new_styles_string += "} "

css = open('pdf_stylesheet.css', 'r').read()

import datetime

s3_filename = dom.h2.get_text() + '_' + datetime.datetime.now().strftime('%s') + '.pdf'

HTML(string=dom.prettify()).write_pdf(s3_filename, stylesheets=[CSS(
    string=css+new_styles_string)])

from ExportUtilities import ExportUtilities
print ExportUtilities.export_to_aws(s3_filename, 'ocexportpdf')

import os
os.remove(s3_filename)