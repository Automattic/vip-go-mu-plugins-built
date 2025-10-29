"use strict";
var wp;
(wp ||= {}).mediaUtils = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // wordpress-external:@wordpress/element
  var require_element = __commonJS({
    "wordpress-external:@wordpress/element"(exports, module) {
      module.exports = window.wp.element;
    }
  });

  // wordpress-external:@wordpress/i18n
  var require_i18n = __commonJS({
    "wordpress-external:@wordpress/i18n"(exports, module) {
      module.exports = window.wp.i18n;
    }
  });

  // wordpress-external:@wordpress/blob
  var require_blob = __commonJS({
    "wordpress-external:@wordpress/blob"(exports, module) {
      module.exports = window.wp.blob;
    }
  });

  // wordpress-external:@wordpress/api-fetch
  var require_api_fetch = __commonJS({
    "wordpress-external:@wordpress/api-fetch"(exports, module) {
      module.exports = window.wp.apiFetch;
    }
  });

  // wordpress-external:@wordpress/private-apis
  var require_private_apis = __commonJS({
    "wordpress-external:@wordpress/private-apis"(exports, module) {
      module.exports = window.wp.privateApis;
    }
  });

  // packages/media-utils/build-module/index.js
  var index_exports = {};
  __export(index_exports, {
    MediaUpload: () => media_upload_default,
    privateApis: () => privateApis,
    transformAttachment: () => transformAttachment,
    uploadMedia: () => uploadMedia,
    validateFileSize: () => validateFileSize,
    validateMimeType: () => validateMimeType,
    validateMimeTypeForUser: () => validateMimeTypeForUser
  });

  // packages/media-utils/build-module/components/media-upload/index.js
  var import_element = __toESM(require_element());
  var import_i18n = __toESM(require_i18n());
  var DEFAULT_EMPTY_GALLERY = [];
  var getFeaturedImageMediaFrame = () => {
    const { wp } = window;
    return wp.media.view.MediaFrame.Select.extend({
      /**
       * Enables the Set Featured Image Button.
       *
       * @param {Object} toolbar toolbar for featured image state
       * @return {void}
       */
      featuredImageToolbar(toolbar) {
        this.createSelectToolbar(toolbar, {
          text: wp.media.view.l10n.setFeaturedImage,
          state: this.options.state
        });
      },
      /**
       * Handle the edit state requirements of selected media item.
       *
       * @return {void}
       */
      editState() {
        const selection = this.state("featured-image").get("selection");
        const view = new wp.media.view.EditImage({
          model: selection.single(),
          controller: this
        }).render();
        this.content.set(view);
        view.loadEditor();
      },
      /**
       * Create the default states.
       *
       * @return {void}
       */
      createStates: function createStates() {
        this.on(
          "toolbar:create:featured-image",
          this.featuredImageToolbar,
          this
        );
        this.on("content:render:edit-image", this.editState, this);
        this.states.add([
          new wp.media.controller.FeaturedImage(),
          new wp.media.controller.EditImage({
            model: this.options.editImage
          })
        ]);
      }
    });
  };
  var getSingleMediaFrame = () => {
    const { wp } = window;
    return wp.media.view.MediaFrame.Select.extend({
      /**
       * Create the default states on the frame.
       */
      createStates() {
        const options = this.options;
        if (this.options.states) {
          return;
        }
        this.states.add([
          // Main states.
          new wp.media.controller.Library({
            library: wp.media.query(options.library),
            multiple: options.multiple,
            title: options.title,
            priority: 20,
            filterable: "uploaded"
            // Allow filtering by uploaded images.
          }),
          new wp.media.controller.EditImage({
            model: options.editImage
          })
        ]);
      }
    });
  };
  var getGalleryDetailsMediaFrame = () => {
    const { wp } = window;
    return wp.media.view.MediaFrame.Post.extend({
      /**
       * Set up gallery toolbar.
       *
       * @return {void}
       */
      galleryToolbar() {
        const editing = this.state().get("editing");
        this.toolbar.set(
          new wp.media.view.Toolbar({
            controller: this,
            items: {
              insert: {
                style: "primary",
                text: editing ? wp.media.view.l10n.updateGallery : wp.media.view.l10n.insertGallery,
                priority: 80,
                requires: { library: true },
                /**
                 * @fires wp.media.controller.State#update
                 */
                click() {
                  const controller = this.controller, state = controller.state();
                  controller.close();
                  state.trigger(
                    "update",
                    state.get("library")
                  );
                  controller.setState(controller.options.state);
                  controller.reset();
                }
              }
            }
          })
        );
      },
      /**
       * Handle the edit state requirements of selected media item.
       *
       * @return {void}
       */
      editState() {
        const selection = this.state("gallery").get("selection");
        const view = new wp.media.view.EditImage({
          model: selection.single(),
          controller: this
        }).render();
        this.content.set(view);
        view.loadEditor();
      },
      /**
       * Create the default states.
       *
       * @return {void}
       */
      createStates: function createStates() {
        this.on("toolbar:create:main-gallery", this.galleryToolbar, this);
        this.on("content:render:edit-image", this.editState, this);
        this.states.add([
          new wp.media.controller.Library({
            id: "gallery",
            title: wp.media.view.l10n.createGalleryTitle,
            priority: 40,
            toolbar: "main-gallery",
            filterable: "uploaded",
            multiple: "add",
            editable: false,
            library: wp.media.query({
              type: "image",
              ...this.options.library
            })
          }),
          new wp.media.controller.EditImage({
            model: this.options.editImage
          }),
          new wp.media.controller.GalleryEdit({
            library: this.options.selection,
            editing: this.options.editing,
            menu: "gallery",
            displaySettings: false,
            multiple: true
          }),
          new wp.media.controller.GalleryAdd()
        ]);
      }
    });
  };
  var slimImageObject = (img) => {
    const attrSet = [
      "sizes",
      "mime",
      "type",
      "subtype",
      "id",
      "url",
      "alt",
      "link",
      "caption"
    ];
    return attrSet.reduce((result, key) => {
      if (img?.hasOwnProperty(key)) {
        result[key] = img[key];
      }
      return result;
    }, {});
  };
  var getAttachmentsCollection = (ids) => {
    const { wp } = window;
    return wp.media.query({
      order: "ASC",
      orderby: "post__in",
      post__in: ids,
      posts_per_page: -1,
      query: true,
      type: "image"
    });
  };
  var MediaUpload = class extends import_element.Component {
    constructor() {
      super(...arguments);
      this.openModal = this.openModal.bind(this);
      this.onOpen = this.onOpen.bind(this);
      this.onSelect = this.onSelect.bind(this);
      this.onUpdate = this.onUpdate.bind(this);
      this.onClose = this.onClose.bind(this);
    }
    initializeListeners() {
      this.frame.on("select", this.onSelect);
      this.frame.on("update", this.onUpdate);
      this.frame.on("open", this.onOpen);
      this.frame.on("close", this.onClose);
    }
    /**
     * Sets the Gallery frame and initializes listeners.
     *
     * @return {void}
     */
    buildAndSetGalleryFrame() {
      const {
        addToGallery = false,
        allowedTypes,
        multiple = false,
        value = DEFAULT_EMPTY_GALLERY
      } = this.props;
      if (value === this.lastGalleryValue) {
        return;
      }
      const { wp } = window;
      this.lastGalleryValue = value;
      if (this.frame) {
        this.frame.remove();
      }
      let currentState;
      if (addToGallery) {
        currentState = "gallery-library";
      } else {
        currentState = value && value.length ? "gallery-edit" : "gallery";
      }
      if (!this.GalleryDetailsMediaFrame) {
        this.GalleryDetailsMediaFrame = getGalleryDetailsMediaFrame();
      }
      const attachments = getAttachmentsCollection(value);
      const selection = new wp.media.model.Selection(attachments.models, {
        props: attachments.props.toJSON(),
        multiple
      });
      this.frame = new this.GalleryDetailsMediaFrame({
        mimeType: allowedTypes,
        state: currentState,
        multiple,
        selection,
        editing: !!value?.length
      });
      wp.media.frame = this.frame;
      this.initializeListeners();
    }
    /**
     * Initializes the Media Library requirements for the featured image flow.
     *
     * @return {void}
     */
    buildAndSetFeatureImageFrame() {
      const { wp } = window;
      const { value: featuredImageId, multiple, allowedTypes } = this.props;
      const featuredImageFrame = getFeaturedImageMediaFrame();
      const attachments = getAttachmentsCollection(featuredImageId);
      const selection = new wp.media.model.Selection(attachments.models, {
        props: attachments.props.toJSON()
      });
      this.frame = new featuredImageFrame({
        mimeType: allowedTypes,
        state: "featured-image",
        multiple,
        selection,
        editing: featuredImageId
      });
      wp.media.frame = this.frame;
      wp.media.view.settings.post = {
        ...wp.media.view.settings.post,
        featuredImageId: featuredImageId || -1
      };
    }
    /**
     * Initializes the Media Library requirements for the single image flow.
     *
     * @return {void}
     */
    buildAndSetSingleMediaFrame() {
      const { wp } = window;
      const {
        allowedTypes,
        multiple = false,
        title = (0, import_i18n.__)("Select or Upload Media"),
        value
      } = this.props;
      const frameConfig = {
        title,
        multiple
      };
      if (!!allowedTypes) {
        frameConfig.library = { type: allowedTypes };
      }
      if (this.frame) {
        this.frame.remove();
      }
      const singleImageFrame = getSingleMediaFrame();
      const attachments = getAttachmentsCollection(value);
      const selection = new wp.media.model.Selection(attachments.models, {
        props: attachments.props.toJSON()
      });
      this.frame = new singleImageFrame({
        mimeType: allowedTypes,
        multiple,
        selection,
        ...frameConfig
      });
      wp.media.frame = this.frame;
    }
    componentWillUnmount() {
      this.frame?.remove();
    }
    onUpdate(selections) {
      const { onSelect, multiple = false } = this.props;
      const state = this.frame.state();
      const selectedImages = selections || state.get("selection");
      if (!selectedImages || !selectedImages.models.length) {
        return;
      }
      if (multiple) {
        onSelect(
          selectedImages.models.map(
            (model) => slimImageObject(model.toJSON())
          )
        );
      } else {
        onSelect(slimImageObject(selectedImages.models[0].toJSON()));
      }
    }
    onSelect() {
      const { onSelect, multiple = false } = this.props;
      const attachment = this.frame.state().get("selection").toJSON();
      onSelect(multiple ? attachment : attachment[0]);
    }
    onOpen() {
      const { wp } = window;
      const { value } = this.props;
      this.updateCollection();
      if (this.props.mode) {
        this.frame.content.mode(this.props.mode);
      }
      const hasMedia = Array.isArray(value) ? !!value?.length : !!value;
      if (!hasMedia) {
        return;
      }
      const isGallery = this.props.gallery;
      const selection = this.frame.state().get("selection");
      const valueArray = Array.isArray(value) ? value : [value];
      if (!isGallery) {
        valueArray.forEach((id) => {
          selection.add(wp.media.attachment(id));
        });
      }
      const attachments = getAttachmentsCollection(valueArray);
      attachments.more().done(function() {
        if (isGallery && attachments?.models?.length) {
          selection.add(attachments.models);
        }
      });
    }
    onClose() {
      const { onClose } = this.props;
      if (onClose) {
        onClose();
      }
      this.frame.detach();
    }
    updateCollection() {
      const frameContent = this.frame.content.get();
      if (frameContent && frameContent.collection) {
        const collection = frameContent.collection;
        collection.toArray().forEach((model) => model.trigger("destroy", model));
        collection.mirroring._hasMore = true;
        collection.more();
      }
    }
    openModal() {
      const {
        gallery = false,
        unstableFeaturedImageFlow = false,
        modalClass
      } = this.props;
      if (gallery) {
        this.buildAndSetGalleryFrame();
      } else {
        this.buildAndSetSingleMediaFrame();
      }
      if (modalClass) {
        this.frame.$el.addClass(modalClass);
      }
      if (unstableFeaturedImageFlow) {
        this.buildAndSetFeatureImageFrame();
      }
      this.initializeListeners();
      this.frame.open();
    }
    render() {
      return this.props.render({ open: this.openModal });
    }
  };
  var media_upload_default = MediaUpload;

  // packages/media-utils/build-module/utils/upload-media.js
  var import_i18n5 = __toESM(require_i18n());
  var import_blob = __toESM(require_blob());

  // packages/media-utils/build-module/utils/upload-to-server.js
  var import_api_fetch = __toESM(require_api_fetch());

  // packages/media-utils/build-module/utils/flatten-form-data.js
  function isPlainObject(data) {
    return data !== null && typeof data === "object" && Object.getPrototypeOf(data) === Object.prototype;
  }
  function flattenFormData(formData, key, data) {
    if (isPlainObject(data)) {
      for (const [name, value] of Object.entries(data)) {
        flattenFormData(formData, `${key}[${name}]`, value);
      }
    } else if (data !== void 0) {
      formData.append(key, String(data));
    }
  }

  // packages/media-utils/build-module/utils/transform-attachment.js
  function transformAttachment(attachment) {
    const { alt_text, source_url, ...savedMediaProps } = attachment;
    return {
      ...savedMediaProps,
      alt: attachment.alt_text,
      caption: attachment.caption?.raw ?? "",
      title: attachment.title.raw,
      url: attachment.source_url,
      poster: attachment._embedded?.["wp:featuredmedia"]?.[0]?.source_url || void 0
    };
  }

  // packages/media-utils/build-module/utils/upload-to-server.js
  async function uploadToServer(file, additionalData = {}, signal) {
    const data = new FormData();
    data.append("file", file, file.name || file.type.replace("/", "."));
    for (const [key, value] of Object.entries(additionalData)) {
      flattenFormData(
        data,
        key,
        value
      );
    }
    return transformAttachment(
      await (0, import_api_fetch.default)({
        // This allows the video block to directly get a video's poster image.
        path: "/wp/v2/media?_embed=wp:featuredmedia",
        body: data,
        method: "POST",
        signal
      })
    );
  }

  // packages/media-utils/build-module/utils/validate-mime-type.js
  var import_i18n2 = __toESM(require_i18n());

  // packages/media-utils/build-module/utils/upload-error.js
  var UploadError = class extends Error {
    code;
    file;
    constructor({ code, message, file, cause }) {
      super(message, { cause });
      Object.setPrototypeOf(this, new.target.prototype);
      this.code = code;
      this.file = file;
    }
  };

  // packages/media-utils/build-module/utils/validate-mime-type.js
  function validateMimeType(file, allowedTypes) {
    if (!allowedTypes) {
      return;
    }
    const isAllowedType = allowedTypes.some((allowedType) => {
      if (allowedType.includes("/")) {
        return allowedType === file.type;
      }
      return file.type.startsWith(`${allowedType}/`);
    });
    if (file.type && !isAllowedType) {
      throw new UploadError({
        code: "MIME_TYPE_NOT_SUPPORTED",
        message: (0, import_i18n2.sprintf)(
          // translators: %s: file name.
          (0, import_i18n2.__)("%s: Sorry, this file type is not supported here."),
          file.name
        ),
        file
      });
    }
  }

  // packages/media-utils/build-module/utils/validate-mime-type-for-user.js
  var import_i18n3 = __toESM(require_i18n());

  // packages/media-utils/build-module/utils/get-mime-types-array.js
  function getMimeTypesArray(wpMimeTypesObject) {
    if (!wpMimeTypesObject) {
      return null;
    }
    return Object.entries(wpMimeTypesObject).flatMap(
      ([extensionsString, mime]) => {
        const [type] = mime.split("/");
        const extensions = extensionsString.split("|");
        return [
          mime,
          ...extensions.map(
            (extension) => `${type}/${extension}`
          )
        ];
      }
    );
  }

  // packages/media-utils/build-module/utils/validate-mime-type-for-user.js
  function validateMimeTypeForUser(file, wpAllowedMimeTypes) {
    const allowedMimeTypesForUser = getMimeTypesArray(wpAllowedMimeTypes);
    if (!allowedMimeTypesForUser) {
      return;
    }
    const isAllowedMimeTypeForUser = allowedMimeTypesForUser.includes(
      file.type
    );
    if (file.type && !isAllowedMimeTypeForUser) {
      throw new UploadError({
        code: "MIME_TYPE_NOT_ALLOWED_FOR_USER",
        message: (0, import_i18n3.sprintf)(
          // translators: %s: file name.
          (0, import_i18n3.__)(
            "%s: Sorry, you are not allowed to upload this file type."
          ),
          file.name
        ),
        file
      });
    }
  }

  // packages/media-utils/build-module/utils/validate-file-size.js
  var import_i18n4 = __toESM(require_i18n());
  function validateFileSize(file, maxUploadFileSize) {
    if (file.size <= 0) {
      throw new UploadError({
        code: "EMPTY_FILE",
        message: (0, import_i18n4.sprintf)(
          // translators: %s: file name.
          (0, import_i18n4.__)("%s: This file is empty."),
          file.name
        ),
        file
      });
    }
    if (maxUploadFileSize && file.size > maxUploadFileSize) {
      throw new UploadError({
        code: "SIZE_ABOVE_LIMIT",
        message: (0, import_i18n4.sprintf)(
          // translators: %s: file name.
          (0, import_i18n4.__)(
            "%s: This file exceeds the maximum upload size for this site."
          ),
          file.name
        ),
        file
      });
    }
  }

  // packages/media-utils/build-module/utils/upload-media.js
  function uploadMedia({
    wpAllowedMimeTypes,
    allowedTypes,
    additionalData = {},
    filesList,
    maxUploadFileSize,
    onError,
    onFileChange,
    signal,
    multiple = true
  }) {
    if (!multiple && filesList.length > 1) {
      onError?.(new Error((0, import_i18n5.__)("Only one file can be used here.")));
      return;
    }
    const validFiles = [];
    const filesSet = [];
    const setAndUpdateFiles = (index, value) => {
      if (!window.__experimentalMediaProcessing) {
        if (filesSet[index]?.url) {
          (0, import_blob.revokeBlobURL)(filesSet[index].url);
        }
      }
      filesSet[index] = value;
      onFileChange?.(
        filesSet.filter((attachment) => attachment !== null)
      );
    };
    for (const mediaFile of filesList) {
      try {
        validateMimeTypeForUser(mediaFile, wpAllowedMimeTypes);
      } catch (error) {
        onError?.(error);
        continue;
      }
      try {
        validateMimeType(mediaFile, allowedTypes);
      } catch (error) {
        onError?.(error);
        continue;
      }
      try {
        validateFileSize(mediaFile, maxUploadFileSize);
      } catch (error) {
        onError?.(error);
        continue;
      }
      validFiles.push(mediaFile);
      if (!window.__experimentalMediaProcessing) {
        filesSet.push({ url: (0, import_blob.createBlobURL)(mediaFile) });
        onFileChange?.(filesSet);
      }
    }
    validFiles.map(async (file, index) => {
      try {
        const attachment = await uploadToServer(
          file,
          additionalData,
          signal
        );
        setAndUpdateFiles(index, attachment);
      } catch (error) {
        setAndUpdateFiles(index, null);
        let message;
        if (typeof error === "object" && error !== null && "message" in error) {
          message = typeof error.message === "string" ? error.message : String(error.message);
        } else {
          message = (0, import_i18n5.sprintf)(
            // translators: %s: file name
            (0, import_i18n5.__)("Error while uploading file %s to the media library."),
            file.name
          );
        }
        onError?.(
          new UploadError({
            code: "GENERAL",
            message,
            file,
            cause: error instanceof Error ? error : void 0
          })
        );
      }
    });
  }

  // packages/media-utils/build-module/utils/sideload-media.js
  var import_i18n6 = __toESM(require_i18n());

  // packages/media-utils/build-module/utils/sideload-to-server.js
  var import_api_fetch2 = __toESM(require_api_fetch());
  async function sideloadToServer(file, attachmentId, additionalData = {}, signal) {
    const data = new FormData();
    data.append("file", file, file.name || file.type.replace("/", "."));
    for (const [key, value] of Object.entries(additionalData)) {
      flattenFormData(
        data,
        key,
        value
      );
    }
    return transformAttachment(
      await (0, import_api_fetch2.default)({
        path: `/wp/v2/media/${attachmentId}/sideload`,
        body: data,
        method: "POST",
        signal
      })
    );
  }

  // packages/media-utils/build-module/utils/sideload-media.js
  var noop = () => {
  };
  async function sideloadMedia({
    file,
    attachmentId,
    additionalData = {},
    signal,
    onFileChange,
    onError = noop
  }) {
    try {
      const attachment = await sideloadToServer(
        file,
        attachmentId,
        additionalData,
        signal
      );
      onFileChange?.([attachment]);
    } catch (error) {
      let message;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = (0, import_i18n6.sprintf)(
          // translators: %s: file name
          (0, import_i18n6.__)("Error while sideloading file %s to the server."),
          file.name
        );
      }
      onError(
        new UploadError({
          code: "GENERAL",
          message,
          file,
          cause: error instanceof Error ? error : void 0
        })
      );
    }
  }

  // packages/media-utils/build-module/lock-unlock.js
  var import_private_apis = __toESM(require_private_apis());
  var { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)(
    "I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.",
    "@wordpress/media-utils"
  );

  // packages/media-utils/build-module/private-apis.js
  var privateApis = {};
  lock(privateApis, {
    sideloadMedia
  });
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=index.js.map
