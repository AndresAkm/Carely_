import path from 'path';
import { randomUUID } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import env from '../environment/env.js';
import AppError from '../../common/errors/AppError.js';

const { supabase } = env;

const isConfigured = () =>
  Boolean(
    supabase.url &&
      supabase.s3AccessKeyId &&
      supabase.s3SecretAccessKey &&
      supabase.storageBucket
  );

const getSupabaseHost = () => {
  try {
    return new URL(supabase.url).host;
  } catch {
    return null;
  }
};

const buildS3Endpoint = () => {
  const host = getSupabaseHost();
  if (!host) return null;
  return `https://${host.replace('.supabase.co', '.storage.supabase.co')}/storage/v1/s3`;
};

let client = null;

const getClient = () => {
  if (client) return client;
  if (!isConfigured()) {
    throw new AppError('Supabase Storage no está configurado.', 500);
  }
  client = new S3Client({
    endpoint: buildS3Endpoint(),
    region: 'us-east-1',
    credentials: {
      accessKeyId: supabase.s3AccessKeyId,
      secretAccessKey: supabase.s3SecretAccessKey,
    },
    forcePathStyle: true,
  });
  return client;
};

const buildPublicUrl = (key) => {
  const host = getSupabaseHost();
  if (!host) return null;
  return `https://${host}/storage/v1/object/public/${supabase.storageBucket}/${key}`;
};

const uploadFile = async ({ buffer, mimetype, originalname, folder = 'products' }) => {
  if (!buffer) {
    throw new AppError('No se recibió ningún archivo.', 400);
  }

  const ext = path.extname(originalname || '').toLowerCase() || '.jpg';
  const key = `${folder}/${Date.now()}-${randomUUID()}${ext}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: supabase.storageBucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return buildPublicUrl(key);
};

const deleteFile = async (imageUrl) => {
  if (!imageUrl || !isConfigured()) return;

  const publicPath = `/storage/v1/object/public/${supabase.storageBucket}/`;
  const index = imageUrl.indexOf(publicPath);
  if (index === -1) return;

  const key = imageUrl.slice(index + publicPath.length);
  if (!key) return;

  await getClient().send(
    new DeleteObjectCommand({
      Bucket: supabase.storageBucket,
      Key: key,
    })
  );
};

const fileExists = async (key) => {
  try {
    await getClient().send(
      new HeadObjectCommand({
        Bucket: supabase.storageBucket,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
};

const supabaseStorage = {
  isConfigured,
  buildPublicUrl,
  uploadFile,
  deleteFile,
  fileExists,
};

export default supabaseStorage;