import {allFormat, StartScratch,ArticlePost,BookLearnings,ShareTips,RecentLearning,FavouriteTool,ShareStruggle,FormatContent } from './formatData';

export const fetchAllFormat = () => {
    return allFormat;
};
type FormatItem = { content: string }[];

export const fetchFormatRecomand = (number: number) => {
    const itemMappings: { [key: number]:FormatItem} = {
        1: StartScratch,
        2: ArticlePost,
        3: BookLearnings,
        4: ShareTips,
        5: RecentLearning,
        6: FavouriteTool,
        7: ShareStruggle,
        8: FormatContent,
    };
    const selectedFormat = itemMappings[number];
    return selectedFormat ? selectedFormat : [];
};

