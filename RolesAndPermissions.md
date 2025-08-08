@Module({
imports: [
I18nModule.forRoot({
fallbackLanguage: 'en',
loaderOptions: {
path: path.join(__dirname, '/i18n/'),
watch: true,
},
typesOutputPath: path.join(__dirname, '../src/generated/i18n.generated.ts'),
}),
],
controllers: [],
})

import { I18nTranslations } from './generated/i18n.generated.ts';
@Get()
async getHello(@I18n() i18n: I18nContext<I18nTranslations>) {
return await i18n.t('test.HELLO');
}
Pass this type into the generic type properties of the I18nContext or I18nService

Before Start in new thing , complete all existing modules
Write a explanation of each module and keep it in the same folder

### when dealing with class validator use i18nValidationMessage in message place

like this @Min(5, { try it out
message: i18nValidationMessage('validation.MIN', { message: 'COOL' }),
})

tip
By using the i18nValidationMessage helper function you can pass in extra arguments or make use of internal class-validator properties such as property, value, constraints.0.

=> lets try this i think "NOT_EMPTY": "{property} cannot be empty",
property is refer to key this want to make validation for it

"MIN": "{property} with value: \"{value}\" needs to be at least {constraints.0}, ow and {message}",
constraints.0 is the min(3)
