#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, request, Response, render_template
import os
import json

dist = "./dist"

app = Flask(__name__,
            template_folder=dist,
            static_folder=dist + "/static")

# 启动python服务默认打开的页面


@ app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('index.html')

# 获取歌曲列表的接口


@ app.route('/music/list', methods=['POST'])
def get_music_list():
    file_url = request.json.get("fileUrl")
    music = [d for d in os.listdir(file_url)]
    music_list = []
    for m in music:
        if os.path.splitext(m)[1] == '.mp3':  # 目录下包含.mp3的文件
            music_list.append(m)
    print(music_list)
    str_json = json.dumps(music_list, indent=2,
                          ensure_ascii=False)  # json转为string

    return str_json

# 获取单个音频文件的接口，仅限MP3文件


@app.route('/music/file', methods=['POST'])
def stream_mp3():
    path = request.json.get("file")
    file = open(path, 'rb')
    return Response(file, mimetype="audio/mpeg3")

# 获取歌词文件的接口，仅限lrc文件


@app.route('/music/lyric', methods=['POST'])
def stream_lyric():
    path = request.json.get("file")
    file = open(path, 'rb')
    return Response(file)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
