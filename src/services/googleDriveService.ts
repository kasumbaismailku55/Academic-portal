/**
 * Google Drive REST API v3 Integration Service
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

export const GoogleDriveService = {
  /**
   * Find or create the standard EduPortal Cloud Backups directory
   */
  async getOrCreateEduPortalFolder(accessToken: string, folderName = 'EduPortal Backups'): Promise<string | null> {
    try {
      // 1. Search for existing folder
      const query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!searchRes.ok) {
        throw new Error(`Failed to search folder: ${searchRes.statusText}`);
      }

      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }

      // 2. Create if not found
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create folder: ${createRes.statusText}`);
      }

      const folderData = await createRes.json();
      return folderData.id;
    } catch (err) {
      console.warn('Error in getOrCreateEduPortalFolder, will fallback to root:', err);
      return null;
    }
  },

  /**
   * List files created by EduPortal or matching search prefix
   */
  async listBackups(accessToken: string): Promise<GoogleDriveFile[]> {
    try {
      const query = "name contains 'EduPortal_' and trashed = false";
      const fields = 'files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink)';
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&fields=${encodeURIComponent(fields)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Google Drive API error: ${res.statusText}`);
      }

      const data = await res.json();
      return data.files || [];
    } catch (err) {
      console.error('Failed to list files from Google Drive:', err);
      throw err;
    }
  },

  /**
   * Upload JSON backup to Google Drive using multipart upload
   */
  async uploadBackup(
    accessToken: string,
    fileName: string,
    payload: any,
    folderId?: string | null
  ): Promise<GoogleDriveFile> {
    const boundary = '-------EduPortalBoundary' + Math.random().toString(36).substring(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata: Record<string, any> = {
      name: fileName,
      mimeType: 'application/json',
      description: 'EduPortal institutional automated cloud backup containing students, syllabus, and assessments',
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const jsonContent = JSON.stringify(payload, null, 2);

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonContent +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Google Drive upload failed: ${res.status} - ${errBody}`);
    }

    return await res.json();
  },

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(accessToken: string, fileId: string): Promise<void> {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete file from Google Drive: ${res.statusText}`);
    }
  },
};
