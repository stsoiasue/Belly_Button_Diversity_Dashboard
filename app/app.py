# import Flask
from flask import Flask, render_template, redirect, jsonify
from model import session, OTU, Sample, Sample_Meta

# initialize flask app
app = Flask(__name__)

# retun dashboard homepage
@app.route('/')
def index():
    return render_template('index.html')

# return list of sample names
@app.route('/names')
def names():
    # query db for sample names
    sample_names = Sample.__table__.columns._data.keys()[1:]
    return jsonify(sample_names)

# return list of OTU descriptions
@app.route('/otu')
def otu():
    # query db otu descriptions
    otu_desc = session.query(OTU)
    # convert to list of values rather than list of tuples
    otu_desc = {desc.otu_id: desc.lowest_taxonomic_unit_found for desc in otu_desc}
    return jsonify(otu_desc)

# return metadata for a given sample
@app.route('/metadata/<sample>')
def metadata(sample):
    # remove prefix from sample name
    sample = sample.lstrip('BB_')
    
    # query db and filter for given sample
    meta_data = (session
                .query(Sample_Meta)
                .filter(Sample_Meta.SAMPLEID == sample))

    for result in meta_data:
        meta_dict = {
            'AGE': result.AGE,
            'BBTYPE': result.BBTYPE,
            'ETHNICITY': result.ETHNICITY,
            'GENDER': result.GENDER,
            'LOCATION': result.LOCATION,
            'SAMPLEID': result.SAMPLEID,
        }

    return jsonify(meta_dict)

# return wekly washing frequency for a given sample
@app.route('/wfreq/<sample>')
def wfreq(sample):
    # remove prefix from sample name
    sample = sample.lstrip('BB_')
    
    # query db for wfreq and return as scalar
    wfreq_query = (session
            .query(Sample_Meta.WFREQ)
            .filter(Sample_Meta.SAMPLEID == sample)
            .scalar())

    return jsonify(wfreq_query)

# return OTU ID and sample values for given sample
@app.route('/sample/<sample>')
def sample(sample):
    # query db for sample value and otu_id
    sample_query = session.query(Sample.otu_id, getattr(Sample, sample))

    # sort sample values in descending order
    sample_query = sorted(sample_query, key=lambda x: x[1], reverse=True)

    # create dict with lists of ids and sample values  
    sample_dict = {
        'otu_ids': [otu[0] for otu in sample_query],
        'sample_values': [otu[1] for otu in sample_query]
    }

    return jsonify(sample_dict)

if __name__ == '__main__':
  app.run(debug=True)