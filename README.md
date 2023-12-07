web文件管理

学习vue时，想练练手。因为经常折腾vps，厌倦了命令行vim编辑文件。

正好顺便练习一下，写个简洁的专注编辑的文件管理界面。

![](https://github.com/hellohechang/hellofile/blob/main/readmeImg/file.png)
![](https://github.com/hellohechang/hellofile/blob/main/readmeImg/file1.png)

```
docker run -d -p 5005:5005 -v /home:/home --name hellofile hellohechang/hellofile:latest
```