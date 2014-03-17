class ExportUtilities:

    @staticmethod
    def export_to_aws(filename, bucket_name, s3_filename=None):
        # Get the document and push to an S3 bucket.
        from boto.s3.connection import S3Connection
        from boto.s3.bucket import Bucket
        from boto.s3.key import Key

        try:
            conn = S3Connection('AKIAIDFEDRWJ4BW5JGMQ', '0b5+2w+/RMRu4HtvziE3VGwrnZdns68WiZ0GGg+2')
            bucket = Bucket(conn, bucket_name)

            key = Key(bucket)
            key.key = s3_filename if s3_filename else filename
            key.set_contents_from_filename(filename)

            bucket.set_acl('public-read', s3_filename if s3_filename else filename)

            # Print the entire URL in the stdout
            return 'http://' + bucket_name + '.s3.amazonaws.com/' + (
                s3_filename if s3_filename else filename)
        except Exception, e:
            print e