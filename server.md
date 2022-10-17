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

## Socket Server

nano /etc/security/limits.conf

* soft     nproc          1048576    
* hard     nproc          1048576   
* soft     nofile         1048576   
* hard     nofile         1048576
root soft     nproc          1048576    
root hard     nproc          1048576   
root soft     nofile         1048576   
root hard     nofile         1048576

nano /etc/pam.d/common-session
nano /etc/pam.d/common-session-noninteractive

session required pam_limits.so

nano /etc/sysctl.conf
fs.file-max = 2097152
