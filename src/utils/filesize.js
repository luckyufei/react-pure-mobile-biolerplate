import filesize from 'filesize';

// 目前还没用到啥参数, 已备后患
const DEFAULT_OPTIONS = {};

export default function(size) {
  return filesize(size, DEFAULT_OPTIONS);
};
