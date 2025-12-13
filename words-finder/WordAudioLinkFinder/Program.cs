using System.Text.RegularExpressions;

if (args.Length <= 0)
{
    Console.WriteLine("ERROR Please provide One argument with the word.");
}

HttpClient client = new();

var result = await client.GetAsync($"https://www.dwds.de/wb/{args[0].Trim()}");

if (!result.IsSuccessStatusCode)
{
    Console.WriteLine("ERROR An error happened while looking for the word.");
    return;
}

var contentBytesArray = await result.Content.ReadAsByteArrayAsync();
var contentAsString = System.Text.Encoding.UTF8.GetString(contentBytesArray, 0, contentBytesArray.Length);

File.WriteAllText("response.html", contentAsString);

//lang=regex
var hyphenationPartRegex = new Regex("""
    <span class="hyphenation" data-id="(.*?)">(?<hyphenation>.*?)<\/span>
    """, RegexOptions.Multiline);

var hyphenationMatch = hyphenationPartRegex.Matches(contentAsString);



if (hyphenationMatch.Count <= 0)
{
    Console.WriteLine("ERROR No hyphenation found for the given word.");
    return;
}

var hyphenation = hyphenationMatch[0].Groups["hyphenation"].Value;
Console.WriteLine($"OK {hyphenation}");