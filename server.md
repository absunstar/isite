## MongoDb
```sh   
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
#  engine:
#  mmapv1:
#  wiredTiger:
  wiredTiger:
    engineConfig:
      cacheSizeGB: .5

```
