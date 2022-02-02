import Joi from 'joi';

export enum SettingKeys {
    BaseUrl = 'baseUrl',
    TrailingSlash = 'trailingSlash',
    AuthOpenIdEnabled = 'auth.openid.enabled',
    AuthOpenIdDiscoveryUrl = 'auth.openid.discoveryUrl',
    AuthOpenIdClientId = 'auth.openid.clientId',
    AuthOpenIdClientSecret = 'auth.openid.clientSecret',
    AuthOpenIdResponseMode = 'auth.openid.responseMode',
    AuthOpenIdIdentifierClaimName = 'auth.openid.idClaimName',
    AuthOpenIdUniqueIdentifierClaimName = 'auth.openid.uidClaimName',
    AuthOpenIdRequestedScopes = 'auth.openid.requestedScopes',
    AmdDefineCompatibilityMode = 'amdDefineCompatibilityMode',
    GlobalSpinnerEnabled = 'globalSpinner.enabled',
    GlobalSpinnerCustomHtml = 'globalSpinner.customHTML',
    I18nEnabled = 'i18n.enabled',
    I18nDefaultLocale = 'i18n.default.locale',
    I18nDefaultCurrency = 'i18n.default.currency',
    I18nSupportedLocales = 'i18n.supported.locale',
    I18nSupportedCurrencies = 'i18n.supported.currency',
    I18nRoutingStrategy = 'i18n.routingStrategy',
    OverrideConfigTrustedOrigins = 'overrideConfigTrustedOrigins',
    OnPropsUpdate = 'onPropsUpdate',
}

export const enum TrailingSlashValues {
    DoNothing = 'doNothing',
    redirectToNonTrailingSlash = 'redirectToNonTrailingSlash',
    redirectToTrailingSlash = 'redirectToTrailingSlash',
}

export enum RoutingStrategyValues {
    PrefixExceptDefault = 'prefix_except_default',
    Prefix = 'prefix',
    //TODO: add in future: "host"
}

export const enum Scope {
    Ilc = 'ilc',
    Registry = 'registry',
}

export const enum SettingTypes {
    Boolean = 'boolean',
    Url = 'url',
    String = 'string',
    StringArray = 'string[]',
    Enum = 'enum',
    Password = 'password',
}


export enum OnPropsUpdateValues {
    Remount = 'remount',
    Update = 'update',
}

type SettingValue = string | boolean | TrailingSlashValues | string[];

export interface Setting {
    key: SettingKeys,
    value: SettingValue,
    default: SettingValue,
    scope: Scope,
    secret: boolean,
    meta: {
        type: SettingTypes,
        choices?: any[],
    },
}

export const keySchema = Joi.string().min(1).max(50).valid(...Object.values(SettingKeys));

const valueSchema = Joi.alternatives().conditional('key', {
    switch: [
        {
            is: Joi.valid(SettingKeys.TrailingSlash),
            then: Joi.string().valid(
                TrailingSlashValues.DoNothing,
                TrailingSlashValues.redirectToNonTrailingSlash,
                TrailingSlashValues.redirectToTrailingSlash,
            ).required(),
        },
        {
            is: Joi.valid(SettingKeys.I18nRoutingStrategy),
            then: Joi.string().valid(...Object.values(RoutingStrategyValues)).required(),
        },
        {
            is: Joi.valid(
                SettingKeys.AmdDefineCompatibilityMode,
                SettingKeys.AuthOpenIdEnabled,
                SettingKeys.GlobalSpinnerEnabled,
                SettingKeys.I18nEnabled
            ),
            then: Joi.boolean().strict().sensitive().required(),
        },
        {
            is: Joi.valid(
                SettingKeys.I18nSupportedCurrencies,
                SettingKeys.I18nSupportedLocales,
            ),
            then: Joi.array().items(Joi.string()),
        },
        {
            is: Joi.valid(SettingKeys.BaseUrl, SettingKeys.AuthOpenIdDiscoveryUrl),
            then: Joi.string().uri({
                scheme: [/https?/],
                allowRelative: false,
            }).allow(''),
        },
        {
            is: Joi.valid(SettingKeys.OnPropsUpdate),
            then: Joi.string().valid(...Object.values(OnPropsUpdateValues)).required(),
        },
    ],
    otherwise: Joi.string().allow(''),
});

export const partialSettingSchema = Joi.object({
    key: keySchema.required(),
    value: valueSchema,
});
