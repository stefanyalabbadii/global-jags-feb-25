```
gcloud functions deploy generate_thumb_data \
--runtime nodejs18 \
--trigger-event google.storage.object.finalize \
--entry-point generateThumbdata \
--trigger-resource sp24-41200-sfalabba-gj-uploads
```

```

gsutil cp gs://sp23-globaljags-dev-sample-images/china/china1.jpeg gs://sp24-41200-sfalabba-gj-uploads
```